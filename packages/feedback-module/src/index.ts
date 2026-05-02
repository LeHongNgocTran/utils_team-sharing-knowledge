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
  feedback?: {
    filePath?: string;
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
      averages: calculateAverages(entries),
      summary: "Mock feedback shows high relevance and practical value, with enough continuation interest for a follow-up topic."
    });
  }
}

export class RealFeedbackProvider implements FeedbackProvider {
  async collectFeedback(sessionDraft: SessionDraft, context: ModuleExecutionContext): Promise<FeedbackSummary> {
    const validDraft = sessionDraftSchema.parse(sessionDraft);
    const config = context.config as ConfigWithSamples;
    const feedbackPath = config.feedback?.filePath ?? config.sampleData?.feedback ?? "data/samples/feedback.json";
    const entries = (await readJsonFile<unknown[]>(feedbackPath)).map((entry) => feedbackEntrySchema.parse(entry));
    const averages = calculateAverages(entries);

    return feedbackSummarySchema.parse({
      entries,
      averages,
      summary: buildSummary(validDraft, averages, entries)
    });
  }
}

function calculateAverages(entries: FeedbackEntry[]): FeedbackSummary["averages"] {
  return {
    relevance: average(entries.map((entry) => entry.relevance)),
    clarity: average(entries.map((entry) => entry.clarity)),
    practicalValue: average(entries.map((entry) => entry.practicalValue)),
    difficultyFit: average(entries.map((entry) => entry.difficultyFit)),
    continuationInterest: average(entries.map((entry) => entry.continuationInterest))
  };
}

function buildSummary(
  sessionDraft: SessionDraft,
  averages: FeedbackSummary["averages"],
  entries: FeedbackEntry[]
): string {
  const highlights: string[] = [];

  if (averages.relevance >= 4) {
    highlights.push("participants found the topic strongly relevant to current work");
  }
  if (averages.practicalValue >= 4) {
    highlights.push("the session felt practical enough to apply in upcoming work");
  }
  if (averages.difficultyFit < 3.5) {
    highlights.push("the difficulty level should be adjusted in a follow-up session");
  }
  if (averages.continuationInterest >= 4) {
    highlights.push("there is good interest in a follow-up topic");
  }

  const notableComments = entries
    .map((entry) => entry.comment)
    .filter((comment): comment is string => Boolean(comment))
    .slice(0, 2);

  const commentText = notableComments.length > 0
    ? ` Notable comments: ${notableComments.join(" | ")}`
    : "";

  return `Feedback summary for "${sessionDraft.title}": ${highlights.join("; ")}.${commentText}`;
}
