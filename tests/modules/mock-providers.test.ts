import { describe, expect, it } from "vitest";
import { MockContentProvider } from "@tsa/content-module";
import { MockEvaluationProvider } from "@tsa/evaluation-module";
import { MockFeedbackProvider } from "@tsa/feedback-module";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockMemoryProvider } from "@tsa/memory-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockSchedulingProvider } from "@tsa/scheduling-module";
import { MockSlideProvider } from "@tsa/slide-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { MockVotingProvider } from "@tsa/voting-module";
import {
  evaluationResultSchema,
  feedbackSummarySchema,
  gapAnalysisResultSchema,
  memorySaveResultSchema,
  rankedTopicListSchema,
  sessionBriefSchema,
  sessionDraftSchema,
  slideOutlineSchema,
  teamProfileSchema,
  topicGenerationResultSchema,
  topicSelectionResultSchema
} from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

describe("mock providers", () => {
  it("returns schema-valid output for every module in sequence", async () => {
    const context = createTestContext();
    const teamProfile = await new MockProfileProvider().loadTeamProfile(context);
    expect(teamProfileSchema.safeParse(teamProfile).success).toBe(true);

    const gapAnalysis = await new MockGapAnalysisProvider().analyze(teamProfile, context);
    expect(gapAnalysisResultSchema.safeParse(gapAnalysis).success).toBe(true);

    const topicGeneration = await new MockTopicGenerationProvider().generate(gapAnalysis, context);
    expect(topicGenerationResultSchema.safeParse(topicGeneration).success).toBe(true);
    expect(topicGeneration.topics).toHaveLength(10);

    const rankedTopics = await new MockTopicRankingProvider().rank({ topicGeneration, gapAnalysis }, context);
    expect(rankedTopicListSchema.safeParse(rankedTopics).success).toBe(true);

    const topicSelection = await new MockVotingProvider().selectTopic(rankedTopics, context);
    expect(topicSelectionResultSchema.safeParse(topicSelection).success).toBe(true);

    const sessionBrief = await new MockContentProvider().createBrief(topicSelection, context);
    expect(sessionBriefSchema.safeParse(sessionBrief).success).toBe(true);

    const slideOutline = await new MockSlideProvider().createOutline(sessionBrief, context);
    expect(slideOutlineSchema.safeParse(slideOutline).success).toBe(true);

    const sessionDraft = await new MockSchedulingProvider().createSessionDraft({ brief: sessionBrief, slideOutline }, context);
    expect(sessionDraftSchema.safeParse(sessionDraft).success).toBe(true);

    const feedbackSummary = await new MockFeedbackProvider().collectFeedback(sessionDraft, context);
    expect(feedbackSummarySchema.safeParse(feedbackSummary).success).toBe(true);

    const evaluationResult = await new MockEvaluationProvider().evaluate({ selection: topicSelection, feedback: feedbackSummary }, context);
    expect(evaluationResultSchema.safeParse(evaluationResult).success).toBe(true);

    const memorySaveResult = await new MockMemoryProvider().saveArtifacts([], context);
    expect(memorySaveResultSchema.safeParse(memorySaveResult).success).toBe(true);
  });

  it("topic generation handles empty gap lists with fallback topics", async () => {
    const context = createTestContext();
    const topicGeneration = await new MockTopicGenerationProvider().generate(
      {
        teamId: "team-empty",
        summary: "No gaps yet.",
        gaps: [],
        recommendedFocusAreas: []
      },
      context
    );

    expect(topicGeneration.topics).toHaveLength(10);
    expect(topicGenerationResultSchema.safeParse(topicGeneration).success).toBe(true);
  });
});
