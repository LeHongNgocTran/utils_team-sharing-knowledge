import { describe, expect, it } from "vitest";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockSlideProvider } from "@tsa/slide-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { RealContentProvider } from "@tsa/content-module";
import { RealFeedbackProvider } from "@tsa/feedback-module";
import { RealSchedulingProvider } from "@tsa/scheduling-module";
import { RealVotingProvider } from "@tsa/voting-module";
import { feedbackSummarySchema } from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

describe("real feedback provider", () => {
  it("reads sample feedback and produces a schema-valid summary", async () => {
    const context = createTestContext({
      config: {
        sampleData: {
          teamProfile: "data/samples/team-profile.json",
          teamAvailability: "data/samples/team-availability.json",
          roomInventory: "data/samples/room-inventory.json",
          votes: "data/samples/votes.json",
          feedback: "data/samples/feedback.json"
        },
        voting: {
          sourceType: "google-forms-csv",
          filePath: "data/samples/google-forms-votes.csv"
        },
        content: {
          defaultDurationMinutes: 55,
          agendaStyle: "discussion-heavy",
          callToAction: "Choose one practice to try in the next sprint."
        },
        scheduling: {
          durationMinutes: 75,
          slackChannel: "#platform-team"
        }
      }
    });

    const teamProfile = await new MockProfileProvider().loadTeamProfile(context);
    const gapAnalysis = await new MockGapAnalysisProvider().analyze(teamProfile, context);
    const topicGeneration = await new MockTopicGenerationProvider().generate(gapAnalysis, context);
    const rankedTopics = await new MockTopicRankingProvider().rank({ topicGeneration, gapAnalysis }, context);
    const selection = await new RealVotingProvider().selectTopic(rankedTopics, context);
    const brief = await new RealContentProvider().createBrief(selection, context);
    const slideOutline = await new MockSlideProvider().createOutline(brief, context);
    const sessionDraft = await new RealSchedulingProvider().createSessionDraft({ brief, slideOutline }, context);
    const feedbackSummary = await new RealFeedbackProvider().collectFeedback(sessionDraft, context);

    expect(feedbackSummarySchema.safeParse(feedbackSummary).success).toBe(true);
    expect(feedbackSummary.summary).toContain("Feedback summary");
    expect(feedbackSummary.entries).toHaveLength(3);
  });
});
