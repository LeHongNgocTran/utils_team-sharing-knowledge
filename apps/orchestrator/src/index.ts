import { ArtifactWriter, getProvider, type ProviderRegistry, WorkflowRunner, type WorkflowStep } from "@tsa/core";
import {
  type ArtifactReference,
  type EvaluationResult,
  type FeedbackSummary,
  type GapAnalysisResult,
  type MemorySaveResult,
  type ProviderKind,
  providerKindSchema,
  type RankedTopicList,
  type SessionBrief,
  type SessionDraft,
  type SlideOutline,
  type TeamProfile,
  type TopicGenerationResult,
  type TopicSelectionResult
} from "@tsa/schemas";
import { createRunId, nowIso, readJsonFile } from "@tsa/shared";
import { MockProfileProvider, RealProfileProvider, type ProfileProvider } from "@tsa/profile-module";
import { MockGapAnalysisProvider, RealGapAnalysisProvider, type GapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockTopicGenerationProvider, RealTopicGenerationProvider, type TopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider, RealTopicRankingProvider, type TopicRankingProvider } from "@tsa/topic-ranking-module";
import { MockVotingProvider, RealVotingProvider, type VotingProvider } from "@tsa/voting-module";
import { MockContentProvider, RealContentProvider, type ContentProvider } from "@tsa/content-module";
import { MockSlideProvider, RealSlideProvider, type SlideProvider } from "@tsa/slide-module";
import { MockSchedulingProvider, RealSchedulingProvider, type SchedulingProvider } from "@tsa/scheduling-module";
import { MockFeedbackProvider, RealFeedbackProvider, type FeedbackProvider } from "@tsa/feedback-module";
import { MockEvaluationProvider, RealEvaluationProvider, type EvaluationProvider } from "@tsa/evaluation-module";
import { MockMemoryProvider, RealMemoryProvider, type MemoryProvider } from "@tsa/memory-module";
import { z } from "zod";

const orchestratorConfigSchema = z.object({
  runMode: z.enum(["mock", "real"]).default("mock"),
  outputDir: z.string().min(1),
  sampleData: z.record(z.string()).default({}),
  providers: z.record(providerKindSchema),
  reviewCheckpoints: z.record(z.boolean()).default({})
}).passthrough();

type OrchestratorConfig = z.infer<typeof orchestratorConfigSchema>;

type WorkflowProviders = {
  profile: ProfileProvider;
  gapAnalysis: GapAnalysisProvider;
  topicGeneration: TopicGenerationProvider;
  topicRanking: TopicRankingProvider;
  voting: VotingProvider;
  content: ContentProvider;
  slide: SlideProvider;
  scheduling: SchedulingProvider;
  feedback: FeedbackProvider;
  evaluation: EvaluationProvider;
  memory: MemoryProvider;
};

type WorkflowState = Record<string, unknown> & {
  teamProfile?: TeamProfile;
  gapAnalysis?: GapAnalysisResult;
  topicGeneration?: TopicGenerationResult;
  rankedTopics?: RankedTopicList;
  topicSelection?: TopicSelectionResult;
  sessionBrief?: SessionBrief;
  slideOutline?: SlideOutline;
  sessionDraft?: SessionDraft;
  feedbackSummary?: FeedbackSummary;
  evaluationResult?: EvaluationResult;
  memorySaveResult?: MemorySaveResult;
  artifactReferences?: ArtifactReference[];
};

export async function loadConfig(configPath = "configs/default.json"): Promise<OrchestratorConfig> {
  return orchestratorConfigSchema.parse(await readJsonFile<unknown>(configPath));
}

export function createProviderRegistry(): ProviderRegistry<WorkflowProviders> {
  return {
    profile: { mock: new MockProfileProvider(), real: new RealProfileProvider() },
    gapAnalysis: { mock: new MockGapAnalysisProvider(), real: new RealGapAnalysisProvider() },
    topicGeneration: { mock: new MockTopicGenerationProvider(), real: new RealTopicGenerationProvider() },
    topicRanking: { mock: new MockTopicRankingProvider(), real: new RealTopicRankingProvider() },
    voting: { mock: new MockVotingProvider(), real: new RealVotingProvider() },
    content: { mock: new MockContentProvider(), real: new RealContentProvider() },
    slide: { mock: new MockSlideProvider(), real: new RealSlideProvider() },
    scheduling: { mock: new MockSchedulingProvider(), real: new RealSchedulingProvider() },
    feedback: { mock: new MockFeedbackProvider(), real: new RealFeedbackProvider() },
    evaluation: { mock: new MockEvaluationProvider(), real: new RealEvaluationProvider() },
    memory: { mock: new MockMemoryProvider(), real: new RealMemoryProvider() }
  };
}

function selectProvider<K extends keyof WorkflowProviders>(
  registry: ProviderRegistry<WorkflowProviders>,
  config: OrchestratorConfig,
  moduleName: K
): WorkflowProviders[K] {
  return getProvider(registry, moduleName, config.providers[moduleName] ?? "mock");
}

export function createWorkflowSteps(
  registry: ProviderRegistry<WorkflowProviders>,
  config: OrchestratorConfig
): Array<WorkflowStep<WorkflowState>> {
  return [
    {
      name: "load-team-profiles",
      run: async (_state, context) => {
        const teamProfile = await selectProvider(registry, config, "profile").loadTeamProfile(context);
        return { state: { teamProfile }, artifacts: [{ name: "team-profile", data: teamProfile }] };
      }
    },
    {
      name: "analyze-knowledge-gaps",
      run: async (state, context) => {
        if (!state.teamProfile) throw new Error("Missing teamProfile before gap analysis.");
        const gapAnalysis = await selectProvider(registry, config, "gapAnalysis").analyze(state.teamProfile, context);
        return { state: { gapAnalysis }, artifacts: [{ name: "knowledge-gaps", data: gapAnalysis }] };
      }
    },
    {
      name: "generate-topics",
      run: async (state, context) => {
        if (!state.gapAnalysis) throw new Error("Missing gapAnalysis before topic generation.");
        const topicGeneration = await selectProvider(registry, config, "topicGeneration").generate(state.gapAnalysis, context);
        return { state: { topicGeneration }, artifacts: [{ name: "generated-topics", data: topicGeneration }] };
      }
    },
    {
      name: "rank-topics",
      checkpoint: "topicRanking",
      run: async (state, context) => {
        if (!state.topicGeneration || !state.gapAnalysis) throw new Error("Missing topicGeneration or gapAnalysis before ranking.");
        const rankedTopics = await selectProvider(registry, config, "topicRanking").rank(
          { topicGeneration: state.topicGeneration, gapAnalysis: state.gapAnalysis },
          context
        );
        return { state: { rankedTopics }, artifacts: [{ name: "ranked-topics", data: rankedTopics }] };
      }
    },
    {
      name: "export-voting-and-select-topic",
      checkpoint: "topicSelection",
      run: async (state, context) => {
        if (!state.rankedTopics) throw new Error("Missing rankedTopics before voting.");
        const topicSelection = await selectProvider(registry, config, "voting").selectTopic(state.rankedTopics, context);
        return { state: { topicSelection }, artifacts: [{ name: "selected-topic", data: topicSelection }] };
      }
    },
    {
      name: "generate-topic-brief",
      checkpoint: "contentGeneration",
      run: async (state, context) => {
        if (!state.topicSelection) throw new Error("Missing topicSelection before content generation.");
        const sessionBrief = await selectProvider(registry, config, "content").createBrief(state.topicSelection, context);
        return { state: { sessionBrief }, artifacts: [{ name: "topic-brief", data: sessionBrief }] };
      }
    },
    {
      name: "generate-slide-outline",
      run: async (state, context) => {
        if (!state.sessionBrief) throw new Error("Missing sessionBrief before slide outline.");
        const slideOutline = await selectProvider(registry, config, "slide").createOutline(state.sessionBrief, context);
        return { state: { slideOutline }, artifacts: [{ name: "slide-outline", data: slideOutline }] };
      }
    },
    {
      name: "create-session-draft",
      checkpoint: "schedulingDraft",
      run: async (state, context) => {
        if (!state.sessionBrief || !state.slideOutline) throw new Error("Missing sessionBrief or slideOutline before scheduling.");
        const sessionDraft = await selectProvider(registry, config, "scheduling").createSessionDraft(
          { brief: state.sessionBrief, slideOutline: state.slideOutline },
          context
        );
        return { state: { sessionDraft }, artifacts: [{ name: "session-draft", data: sessionDraft }] };
      }
    },
    {
      name: "simulate-feedback",
      run: async (state, context) => {
        if (!state.sessionDraft) throw new Error("Missing sessionDraft before feedback.");
        const feedbackSummary = await selectProvider(registry, config, "feedback").collectFeedback(state.sessionDraft, context);
        return { state: { feedbackSummary }, artifacts: [{ name: "feedback-summary", data: feedbackSummary }] };
      }
    },
    {
      name: "evaluate-session",
      checkpoint: "evaluationResult",
      run: async (state, context) => {
        if (!state.topicSelection || !state.feedbackSummary) throw new Error("Missing topicSelection or feedbackSummary before evaluation.");
        const evaluationResult = await selectProvider(registry, config, "evaluation").evaluate(
          { selection: state.topicSelection, feedback: state.feedbackSummary },
          context
        );
        return { state: { evaluationResult }, artifacts: [{ name: "evaluation-result", data: evaluationResult }] };
      }
    },
    {
      name: "save-artifacts-to-memory",
      run: async (state, context) => {
        const artifactReferences = state.artifactReferences ?? [];
        const memorySaveResult = await selectProvider(registry, config, "memory").saveArtifacts(artifactReferences, context);
        return { state: { memorySaveResult }, artifacts: [{ name: "memory-save-result", data: memorySaveResult }] };
      }
    }
  ];
}

export async function runMockWorkflow(configPath = "configs/default.json") {
  const config = await loadConfig(configPath);
  const runId = createRunId("sharing");
  const startedAt = nowIso();
  const providerSelections = config.providers as Record<string, ProviderKind>;
  const writer = new ArtifactWriter(config.outputDir);
  const artifactDir = `${config.outputDir}/${runId}`;
  const registry = createProviderRegistry();

  const runner = new WorkflowRunner<WorkflowState>({
    runId,
    startedAt,
    artifactDir,
    config,
    providerSelections,
    writer,
    steps: createWorkflowSteps(registry, config),
    initialState: {},
    reviewCheckpoints: config.reviewCheckpoints,
    onCheckpoint: async (checkpoint) => {
      console.log(`[checkpoint:${checkpoint}] placeholder reached`);
    }
  });

  return runner.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const configPath = process.argv[2] ?? "configs/default.json";

  runMockWorkflow(configPath)
    .then(({ workflowRun }) => {
      console.log(`Workflow ${workflowRun.status}: ${workflowRun.runId}`);
      console.log(`Artifacts: ${workflowRun.artifacts.length}`);
      console.log(`Summary: ${workflowRun.summary}`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
