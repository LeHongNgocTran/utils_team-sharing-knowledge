import {
  type FeedbackEntry,
  feedbackEntrySchema,
  type FeedbackSummary,
  feedbackSummarySchema,
  type ModuleExecutionContext,
  type SessionDraft,
  sessionDraftSchema
} from "@tsa/schemas";
import { average, readJsonFile } from "@tsa/shared";

export interface FeedbackProvider {
  collectFeedback(sessionDraft: SessionDraft, context: ModuleExecutionContext): Promise<FeedbackSummary>;
}

type ConfigWithSamples = {
  sampleData?: {
    feedback?: string;
  };
};

export class MockFeedbackProvider implements FeedbackProvider {
  async collectFeedback(sessionDraft: SessionDraft, context: ModuleExecutionContext): Promise<FeedbackSummary> {
    sessionDraftSchema.parse(sessionDraft);
    const config = context.config as ConfigWithSamples;
    const feedbackPath = config.sampleData?.feedback ?? "data/samples/feedback.json";
    const entries = (await readJsonFile<unknown[]>(feedbackPath)).map((entry) => feedbackEntrySchema.parse(entry));

    return feedbackSummarySchema.parse({
      entries,
      averages: this.averages(entries),
      summary: "Mock feedback shows high relevance and practical value, with enough continuation interest for a follow-up topic."
    });
  }

  private averages(entries: FeedbackEntry[]): FeedbackSummary["averages"] {
    return {
      relevance: average(entries.map((entry) => entry.relevance)),
      clarity: average(entries.map((entry) => entry.clarity)),
      practicalValue: average(entries.map((entry) => entry.practicalValue)),
      difficultyFit: average(entries.map((entry) => entry.difficultyFit)),
      continuationInterest: average(entries.map((entry) => entry.continuationInterest))
    };
  }
}

export class RealFeedbackProvider implements FeedbackProvider {
  async collectFeedback(): Promise<FeedbackSummary> {
    throw new Error("RealFeedbackProvider is not implemented. Replace it with a form, Slack survey, or feedback API integration.");
  }
}
