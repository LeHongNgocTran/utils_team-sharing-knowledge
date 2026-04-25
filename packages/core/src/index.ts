import { resolve } from "node:path";
import {
  type ArtifactReference,
  artifactReferenceSchema,
  type ModuleExecutionContext,
  type ProviderKind,
  type WorkflowRun,
  type WorkflowStepResult,
  workflowRunSchema
} from "@tsa/schemas";
import { ensureDir, nowIso, slugify, writeJsonFile } from "@tsa/shared";

export type ModuleName =
  | "profile"
  | "gapAnalysis"
  | "topicGeneration"
  | "topicRanking"
  | "voting"
  | "content"
  | "slide"
  | "scheduling"
  | "feedback"
  | "evaluation"
  | "memory";

export type ProviderRegistry<TProviders extends Record<string, unknown>> = {
  [K in keyof TProviders]: Partial<Record<ProviderKind, TProviders[K]>>;
};

export function getProvider<TProviders extends Record<string, unknown>, K extends keyof TProviders>(
  registry: ProviderRegistry<TProviders>,
  moduleName: K,
  providerKind: ProviderKind
): TProviders[K] {
  const provider = registry[moduleName]?.[providerKind];

  if (!provider) {
    throw new Error(`Provider "${String(providerKind)}" is not registered for module "${String(moduleName)}"`);
  }

  return provider;
}

export type ArtifactPayload = {
  name: string;
  data: unknown;
  type?: "json";
};

export class ArtifactWriter {
  constructor(private readonly outputDir: string) {}

  async prepareRunDir(runId: string): Promise<string> {
    const runDir = resolve(process.cwd(), this.outputDir, runId);
    await ensureDir(runDir);
    return runDir;
  }

  async writeJson(runId: string, name: string, data: unknown): Promise<ArtifactReference> {
    const createdAt = nowIso();
    const fileName = `${slugify(name)}.json`;
    const relativePath = `${this.outputDir}/${runId}/${fileName}`;

    await writeJsonFile(relativePath, data);

    const artifact = {
      name,
      path: relativePath,
      type: "json" as const,
      createdAt
    };

    return artifactReferenceSchema.parse(artifact);
  }

  async writeRunSummary(run: WorkflowRun): Promise<ArtifactReference> {
    return this.writeJson(run.runId, "run-summary", workflowRunSchema.parse(run));
  }
}

export type WorkflowStep<State extends Record<string, unknown>> = {
  name: string;
  checkpoint?: "topicRanking" | "topicSelection" | "contentGeneration" | "schedulingDraft" | "evaluationResult";
  run: (state: State, context: ModuleExecutionContext) => Promise<{
    state: Partial<State>;
    artifacts?: ArtifactPayload[];
  }>;
};

export type WorkflowRunnerOptions<State extends Record<string, unknown>> = {
  runId: string;
  startedAt: string;
  artifactDir: string;
  config: Record<string, unknown>;
  providerSelections: Record<string, ProviderKind>;
  writer: ArtifactWriter;
  steps: Array<WorkflowStep<State>>;
  initialState: State;
  reviewCheckpoints?: Record<string, boolean>;
  onCheckpoint?: (checkpoint: string, state: State) => Promise<void> | void;
};

export class WorkflowRunner<State extends Record<string, unknown>> {
  constructor(private readonly options: WorkflowRunnerOptions<State>) {}

  async run(): Promise<{ state: State; workflowRun: WorkflowRun }> {
    const context: ModuleExecutionContext = {
      runId: this.options.runId,
      startedAt: this.options.startedAt,
      artifactDir: this.options.artifactDir,
      providerSelections: this.options.providerSelections,
      config: this.options.config
    };

    await this.options.writer.prepareRunDir(this.options.runId);

    const workflowRun: WorkflowRun = {
      runId: this.options.runId,
      status: "running",
      startedAt: this.options.startedAt,
      steps: [],
      artifacts: []
    };

    let state = this.options.initialState;

    for (const step of this.options.steps) {
      const startedAt = nowIso();
      const startedMs = Date.now();
      const artifactRefs: ArtifactReference[] = [];

      try {
        const result = await step.run(state, context);
        state = { ...state, ...result.state };

        for (const artifact of result.artifacts ?? []) {
          artifactRefs.push(await this.options.writer.writeJson(this.options.runId, artifact.name, artifact.data));
        }

        workflowRun.artifacts.push(...artifactRefs);
        state = {
          ...state,
          artifactReferences: [
            ...((Array.isArray(state.artifactReferences) ? state.artifactReferences : []) as ArtifactReference[]),
            ...artifactRefs
          ]
        } as State;

        if (step.checkpoint && this.options.reviewCheckpoints?.[step.checkpoint]) {
          await this.options.onCheckpoint?.(step.checkpoint, state);
        }

        workflowRun.steps.push(this.createStepResult(step.name, "success", startedAt, startedMs, artifactRefs));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        workflowRun.steps.push(this.createStepResult(step.name, "failed", startedAt, startedMs, artifactRefs, message));
        workflowRun.status = "failed";
        workflowRun.finishedAt = nowIso();
        workflowRun.summary = `Workflow failed at step "${step.name}": ${message}`;
        await this.options.writer.writeRunSummary(workflowRun);
        throw error;
      }
    }

    workflowRun.status = "success";
    workflowRun.finishedAt = nowIso();
    workflowRun.summary = `Workflow completed ${workflowRun.steps.length} steps successfully.`;
    const summaryRef = await this.options.writer.writeRunSummary(workflowRun);
    workflowRun.artifacts.push(summaryRef);

    return { state, workflowRun: workflowRunSchema.parse(workflowRun) };
  }

  private createStepResult(
    stepName: string,
    status: WorkflowStepResult["status"],
    startedAt: string,
    startedMs: number,
    artifactRefs: ArtifactReference[],
    error?: string
  ): WorkflowStepResult {
    return {
      stepName,
      status,
      startedAt,
      finishedAt: nowIso(),
      durationMs: Date.now() - startedMs,
      artifactRefs,
      error
    };
  }
}
