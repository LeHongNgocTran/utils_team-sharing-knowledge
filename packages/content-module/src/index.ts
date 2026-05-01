import {
  type ModuleExecutionContext,
  type SessionBrief,
  sessionBriefSchema,
  type TopicSelectionResult,
  topicSelectionResultSchema
} from "@tsa/schemas";
import { z } from "zod";

export interface ContentProvider {
  createBrief(selection: TopicSelectionResult, context: ModuleExecutionContext): Promise<SessionBrief>;
}

const contentConfigSchema = z.object({
  content: z.object({
    defaultDurationMinutes: z.number().int().positive().default(50),
    agendaStyle: z.enum(["balanced", "discussion-heavy", "lecture-heavy"]).default("balanced"),
    callToAction: z.string().min(1).default("Choose one lightweight practice to try in the next sprint."),
    audienceOverride: z.array(z.string().min(1)).optional()
  }).default({})
});

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
  async createBrief(selection: TopicSelectionResult, context: ModuleExecutionContext): Promise<SessionBrief> {
    const validSelection = topicSelectionResultSchema.parse(selection);
    const topic = validSelection.selectedTopic;
    const parsedConfig = contentConfigSchema.parse(context.config);
    const contentConfig = parsedConfig.content;
    const agendaItems = buildAgenda(topic.title, contentConfig.defaultDurationMinutes, contentConfig.agendaStyle);

    return sessionBriefSchema.parse({
      topicId: topic.id,
      title: topic.title,
      objective: `Help the team apply ${topic.title.toLowerCase()} in a way that reduces current delivery friction.`,
      audience: contentConfig.audienceOverride ?? topic.targetAudience,
      keyTakeaways: [
        topic.whyNow,
        `Use ${topic.title.toLowerCase()} to address one current team pain point.`,
        contentConfig.callToAction
      ],
      prepNotes: [
        "Bring at least one concrete example from the current team workflow.",
        "Keep the session practical and tie examples back to the selected topic.",
        validSelection.selectionReason
      ].join(" "),
      agenda: {
        items: agendaItems
      }
    });
  }
}

function buildAgenda(
  topicTitle: string,
  totalDurationMinutes: number,
  agendaStyle: "balanced" | "discussion-heavy" | "lecture-heavy"
) {
  const templates = {
    balanced: [0.2, 0.4, 0.3, 0.1],
    "discussion-heavy": [0.15, 0.25, 0.45, 0.15],
    "lecture-heavy": [0.2, 0.5, 0.2, 0.1]
  } as const;

  const weights = templates[agendaStyle];
  const durations = weights.map((weight, index) => {
    if (index === weights.length - 1) {
      const assigned = weights
        .slice(0, -1)
        .reduce((sum, current) => sum + Math.round(totalDurationMinutes * current), 0);
      return totalDurationMinutes - assigned;
    }
    return Math.round(totalDurationMinutes * weight);
  });

  return [
    {
      title: "Context and why this matters now",
      durationMinutes: durations[0],
      notes: `Anchor ${topicTitle} in the current team context and explain why it was selected.`
    },
    {
      title: "Core concepts and examples",
      durationMinutes: durations[1],
      notes: `Explain ${topicTitle} with practical examples and keep the content grounded in team reality.`
    },
    {
      title: "Discussion or team exercise",
      durationMinutes: durations[2],
      notes: "Discuss how the team can adapt the ideas to one real workflow or pain point."
    },
    {
      title: "Actions and follow-up",
      durationMinutes: durations[3],
      notes: "Capture one next action, one owner, and one follow-up question."
    }
  ];
}
