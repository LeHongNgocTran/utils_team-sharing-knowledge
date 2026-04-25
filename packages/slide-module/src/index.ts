import {
  type ModuleExecutionContext,
  type SessionBrief,
  sessionBriefSchema,
  type SlideOutline,
  slideOutlineSchema
} from "@tsa/schemas";

export interface SlideProvider {
  createOutline(brief: SessionBrief, context: ModuleExecutionContext): Promise<SlideOutline>;
}

export class MockSlideProvider implements SlideProvider {
  async createOutline(brief: SessionBrief, _context: ModuleExecutionContext): Promise<SlideOutline> {
    const validBrief = sessionBriefSchema.parse(brief);

    return slideOutlineSchema.parse({
      topicId: validBrief.topicId,
      title: validBrief.title,
      slides: [
        {
          slideNumber: 1,
          title: validBrief.title,
          bullets: ["Session objective", "Why this matters to our team", "Expected outcome"],
          speakerNotes: validBrief.objective
        },
        {
          slideNumber: 2,
          title: "Current Team Context",
          bullets: ["Pain points", "Knowledge gaps", "Where friction appears"],
          speakerNotes: "Use concrete examples from the current team workflow."
        },
        {
          slideNumber: 3,
          title: "Core Concepts",
          bullets: validBrief.keyTakeaways,
          speakerNotes: "Keep this section practical and avoid tool-specific depth."
        },
        {
          slideNumber: 4,
          title: "Team Exercise",
          bullets: ["Pick one real case", "Apply the concept", "Discuss expected improvement"],
          speakerNotes: "Facilitate discussion and capture decisions."
        },
        {
          slideNumber: 5,
          title: "Actions and Follow-up",
          bullets: ["Chosen practice", "Owner", "Next topic suggestion"],
          speakerNotes: "End with a clear next step that can be reviewed later."
        }
      ]
    });
  }
}

export class RealSlideProvider implements SlideProvider {
  async createOutline(_brief: SessionBrief, _context: ModuleExecutionContext): Promise<SlideOutline> {
    throw new Error("RealSlideProvider is not implemented. Replace it with slide generation or markdown export logic.");
  }
}
