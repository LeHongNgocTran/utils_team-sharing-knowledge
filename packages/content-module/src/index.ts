import {
  type ModuleExecutionContext,
  type SessionBrief,
  sessionBriefSchema,
  type TopicSelectionResult,
  topicSelectionResultSchema
} from "@tsa/schemas";

export interface ContentProvider {
  createBrief(selection: TopicSelectionResult, context: ModuleExecutionContext): Promise<SessionBrief>;
}

export class MockContentProvider implements ContentProvider {
  async createBrief(selection: TopicSelectionResult, _context: ModuleExecutionContext): Promise<SessionBrief> {
    const validSelection = topicSelectionResultSchema.parse(selection);
    const topic = validSelection.selectedTopic;

    return sessionBriefSchema.parse({
      topicId: topic.id,
      title: topic.title,
      objective: `Help the team understand ${topic.title.toLowerCase()} and decide one practice to try next sprint.`,
      audience: topic.targetAudience,
      keyTakeaways: [
        "Understand the problem background and why it matters now.",
        "Recognize common failure modes in current team workflows.",
        "Leave with one lightweight practice the team can adopt immediately."
      ],
      prepNotes: "Mock brief. Presenter should add team-specific examples and remove any irrelevant sections before the real session.",
      agenda: {
        items: [
          { title: "Context and pain points", durationMinutes: 10, notes: "Connect the topic to current team gaps." },
          { title: "Core concepts", durationMinutes: 20, notes: "Explain practical concepts with simple examples." },
          { title: "Team exercise", durationMinutes: 15, notes: "Apply the concept to one current workflow." },
          { title: "Action items", durationMinutes: 5, notes: "Choose one follow-up action and owner." }
        ]
      }
    });
  }
}

export class RealContentProvider implements ContentProvider {
  async createBrief(_selection: TopicSelectionResult, _context: ModuleExecutionContext): Promise<SessionBrief> {
    throw new Error("RealContentProvider is not implemented. Replace it with an LLM content preparation provider.");
  }
}
