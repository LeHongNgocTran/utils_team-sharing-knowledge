import {
  type EvaluationResult,
  evaluationResultSchema,
  type FeedbackSummary,
  feedbackSummarySchema,
  type ModuleExecutionContext,
  type TopicSelectionResult,
  topicSelectionResultSchema
} from "@tsa/schemas";

export interface EvaluationProvider {
  evaluate(input: { selection: TopicSelectionResult; feedback: FeedbackSummary }, context: ModuleExecutionContext): Promise<EvaluationResult>;
}

export class MockEvaluationProvider implements EvaluationProvider {
  async evaluate(input: { selection: TopicSelectionResult; feedback: FeedbackSummary }, _context: ModuleExecutionContext): Promise<EvaluationResult> {
    const selection = topicSelectionResultSchema.parse(input.selection);
    const feedback = feedbackSummarySchema.parse(input.feedback);
    const averages = Object.values(feedback.averages);
    const overallScore = Number((averages.reduce((sum, value) => sum + value, 0) / averages.length).toFixed(2));
    const outcome = feedback.averages.continuationInterest >= 4 ? "continue-series" : "useful-needs-improvement";

    return evaluationResultSchema.parse({
      topicId: selection.selectedTopic.id,
      overallScore,
      outcome,
      findings: [
        "The selected topic matched current team needs.",
        "Practical value was strong enough to justify saving the material as reusable knowledge.",
        "Continuation interest suggests a follow-up or workshop format may be useful."
      ],
      nextTopicSuggestions: [
        {
          title: `Part 2: Applying ${selection.selectedTopic.title}`,
          reason: "Feedback indicates the team wants a deeper applied session.",
          priority: "high"
        },
        {
          title: "Create a lightweight team checklist",
          reason: "Turning the session into a reusable checklist would reinforce adoption.",
          priority: "medium"
        }
      ]
    });
  }
}

export class RealEvaluationProvider implements EvaluationProvider {
  async evaluate(_input: { selection: TopicSelectionResult; feedback: FeedbackSummary }, _context: ModuleExecutionContext): Promise<EvaluationResult> {
    throw new Error("RealEvaluationProvider is not implemented. Replace it with rule-based or AI-assisted evaluation.");
  }
}
