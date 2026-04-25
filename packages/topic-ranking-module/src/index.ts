import {
  type GapAnalysisResult,
  type ModuleExecutionContext,
  type RankedTopicList,
  rankedTopicListSchema,
  type TopicGenerationResult,
  topicGenerationResultSchema
} from "@tsa/schemas";

export interface TopicRankingProvider {
  rank(input: { topicGeneration: TopicGenerationResult; gapAnalysis: GapAnalysisResult }, context: ModuleExecutionContext): Promise<RankedTopicList>;
}

export class MockTopicRankingProvider implements TopicRankingProvider {
  async rank(input: { topicGeneration: TopicGenerationResult; gapAnalysis: GapAnalysisResult }, _context: ModuleExecutionContext): Promise<RankedTopicList> {
    const topicGeneration = topicGenerationResultSchema.parse(input.topicGeneration);
    const highPriorityGapIds = new Set(input.gapAnalysis.gaps.filter((gap) => gap.priority === "high").map((gap) => gap.id));

    const ranked = topicGeneration.topics
      .map((topic, index) => {
        const hitsHighPriorityGap = topic.relatedGapIds.some((gapId) => highPriorityGapIds.has(gapId));
        const relevance = hitsHighPriorityGap ? 0.95 : 0.72;
        const difficultyFit = topic.difficulty === "intermediate" ? 0.88 : 0.8;
        const coverage = 0.78 - index * 0.015;
        const novelty = 0.82 - index * 0.01;
        const strategicValue = hitsHighPriorityGap ? 0.9 : 0.76;
        const total = Number(((relevance + difficultyFit + coverage + novelty + strategicValue) / 5).toFixed(2));

        return {
          topic,
          score: {
            topicId: topic.id,
            relevance,
            difficultyFit,
            coverage: Number(coverage.toFixed(2)),
            novelty: Number(novelty.toFixed(2)),
            strategicValue,
            total,
            rationale: hitsHighPriorityGap ? "Matches a high-priority mock knowledge gap." : "Useful evergreen topic with moderate priority."
          }
        };
      })
      .sort((left, right) => right.score.total - left.score.total)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return rankedTopicListSchema.parse({
      items: ranked,
      scoringVersion: "mock-v1"
    });
  }
}

export class RealTopicRankingProvider implements TopicRankingProvider {
  async rank(_input: { topicGeneration: TopicGenerationResult; gapAnalysis: GapAnalysisResult }, _context: ModuleExecutionContext): Promise<RankedTopicList> {
    throw new Error("RealTopicRankingProvider is not implemented. Replace it with deterministic scoring, reranking, or AI scoring.");
  }
}
