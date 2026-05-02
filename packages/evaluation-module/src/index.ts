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
  async evaluate(input: { selection: TopicSelectionResult; feedback: FeedbackSummary }, _context: ModuleExecutionContext): Promise<EvaluationResult> {
    const selection = topicSelectionResultSchema.parse(input.selection);
    const feedback = feedbackSummarySchema.parse(input.feedback);
    const averages = feedback.averages;
    const overallScore = Number((Object.values(averages).reduce((sum, value) => sum + value, 0) / 5).toFixed(2));
    const outcome = determineOutcome(selection, feedback, overallScore);

    return evaluationResultSchema.parse({
      topicId: selection.selectedTopic.id,
      overallScore,
      outcome,
      findings: buildFindings(selection, feedback, outcome),
      nextTopicSuggestions: buildNextTopicSuggestions(selection, outcome)
    });
  }
}

function determineOutcome(
  selection: TopicSelectionResult,
  feedback: FeedbackSummary,
  overallScore: number
): EvaluationResult["outcome"] {
  const { continuationInterest, practicalValue, difficultyFit, relevance, clarity } = feedback.averages;

  if (overallScore >= 4.4 && continuationInterest >= 4.4 && practicalValue >= 4.2) {
    return "continue-series";
  }

  if (difficultyFit <= 2.8) {
    return selection.selectedTopic.difficulty === "advanced" || clarity < 3.5 ? "too-advanced" : "too-basic";
  }

  if (overallScore >= 4 && practicalValue >= 4) {
    return "useful-needs-improvement";
  }

  if (relevance >= 3.7) {
    return "good-not-right-time";
  }

  return "deprioritize";
}

function buildFindings(
  selection: TopicSelectionResult,
  feedback: FeedbackSummary,
  outcome: EvaluationResult["outcome"]
): string[] {
  const findings = [
    `The topic "${selection.selectedTopic.title}" received ${feedback.entries.length} feedback responses.`,
    `Average relevance was ${feedback.averages.relevance} and practical value was ${feedback.averages.practicalValue}.`,
    `Difficulty fit landed at ${feedback.averages.difficultyFit}, which influenced the outcome "${outcome}".`
  ];

  if (feedback.averages.continuationInterest >= 4) {
    findings.push("The team showed healthy interest in a follow-up topic or workshop.");
  }

  const topComments = feedback.entries
    .map((entry) => entry.comment)
    .filter((comment): comment is string => Boolean(comment))
    .slice(0, 2);

  if (topComments.length > 0) {
    findings.push(`Representative feedback: ${topComments.join(" | ")}`);
  }

  return findings;
}

function buildNextTopicSuggestions(
  selection: TopicSelectionResult,
  outcome: EvaluationResult["outcome"]
): EvaluationResult["nextTopicSuggestions"] {
  switch (outcome) {
    case "continue-series":
      return [
        {
          title: `Part 2: Applying ${selection.selectedTopic.title}`,
          reason: "The team wants a deeper follow-up that turns the topic into repeatable practice.",
          priority: "high"
        },
        {
          title: "Hands-on workshop and checklist",
          reason: "A workshop would help the team convert the topic into working agreements.",
          priority: "medium"
        }
      ];
    case "too-advanced":
      return [
        {
          title: `Foundations before ${selection.selectedTopic.title}`,
          reason: "Feedback suggests the team needs a simpler ramp before going deeper.",
          priority: "high"
        }
      ];
    case "too-basic":
      return [
        {
          title: `${selection.selectedTopic.title} advanced clinic`,
          reason: "The current topic felt too basic, so the next session should raise the depth.",
          priority: "medium"
        }
      ];
    case "good-not-right-time":
      return [
        {
          title: `Revisit ${selection.selectedTopic.title} next quarter`,
          reason: "The topic still matters, but the current team timing is not ideal.",
          priority: "medium"
        }
      ];
    case "deprioritize":
      return [
        {
          title: "Choose a more urgent work-linked topic",
          reason: "The team needs something closer to current delivery pressure.",
          priority: "high"
        }
      ];
    case "useful-needs-improvement":
    default:
      return [
        {
          title: `Refined follow-up on ${selection.selectedTopic.title}`,
          reason: "The topic is useful, but the next version should be more focused and practical.",
          priority: "high"
        }
      ];
  }
}
