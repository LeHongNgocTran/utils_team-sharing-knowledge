import {
  type GapAnalysisResult,
  gapAnalysisResultSchema,
  type ModuleExecutionContext,
  type TopicGenerationResult,
  topicGenerationResultSchema
} from "@tsa/schemas";

export interface TopicGenerationProvider {
  generate(gapAnalysis: GapAnalysisResult, context: ModuleExecutionContext): Promise<TopicGenerationResult>;
}

const evergreenTopics = [
  ["topic-api-contracts", "Designing API Contracts That Reduce Rework", "gap-api-contracts"],
  ["topic-observability-basics", "Observability Basics for Faster Incident Debugging", "gap-observability"],
  ["topic-risk-based-testing", "Risk-Based Testing for Product Teams", "gap-risk-based-testing"],
  ["topic-technical-decision-records", "Writing Lightweight Technical Decision Records", "gap-api-contracts"],
  ["topic-testability-design", "Designing Features for Testability", "gap-risk-based-testing"],
  ["topic-debugging-playbooks", "Building Debugging Playbooks for Common Incidents", "gap-observability"],
  ["topic-acceptance-criteria", "Better Acceptance Criteria for Shared Understanding", "gap-api-contracts"],
  ["topic-delivery-retros", "Turning Retrospectives into Learning Topics", "gap-risk-based-testing"],
  ["topic-service-boundaries", "Practical Service Boundary Design", "gap-api-contracts"],
  ["topic-knowledge-sharing-habits", "Making Knowledge Sharing Sustainable", "gap-risk-based-testing"]
] as const;

export class MockTopicGenerationProvider implements TopicGenerationProvider {
  async generate(gapAnalysis: GapAnalysisResult, _context: ModuleExecutionContext): Promise<TopicGenerationResult> {
    const validAnalysis = gapAnalysisResultSchema.parse(gapAnalysis);
    const gaps = new Set(validAnalysis.gaps.map((gap) => gap.id));

    const topics = evergreenTopics.map(([id, title, gapId], index) => ({
      id,
      title,
      overview: `A practical sharing session about ${title.toLowerCase()}.`,
      background: "This topic is generated from mock gap analysis and current team learning goals.",
      whyNow: gaps.has(gapId)
        ? "The related gap appears in the current analysis and has enough team impact to discuss soon."
        : "This is a fallback evergreen topic useful for team capability building.",
      targetAudience: ["engineers", "qa", "tech leads"],
      difficulty: index < 3 ? "intermediate" as const : "beginner" as const,
      expectedImpact: "Reduce repeated work and create reusable knowledge for future sessions.",
      relatedGapIds: gaps.has(gapId) ? [gapId] : []
    }));

    return topicGenerationResultSchema.parse({
      topics,
      generationNotes: "Mock provider generated 10 schema-valid topic cards."
    });
  }
}

export class RealTopicGenerationProvider implements TopicGenerationProvider {
  async generate(_gapAnalysis: GapAnalysisResult, _context: ModuleExecutionContext): Promise<TopicGenerationResult> {
    throw new Error("RealTopicGenerationProvider is not implemented. Replace it with an LLM or topic mining provider.");
  }
}
