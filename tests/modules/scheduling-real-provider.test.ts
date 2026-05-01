import { describe, expect, it } from "vitest";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockSlideProvider } from "@tsa/slide-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { RealContentProvider } from "@tsa/content-module";
import { RealSchedulingProvider } from "@tsa/scheduling-module";
import { RealVotingProvider } from "@tsa/voting-module";
import { sessionDraftSchema } from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

describe("real scheduling provider", () => {
  it("creates a schema-valid session draft with notification drafts", async () => {
    const context = createTestContext({
      config: {
        sampleData: {
          teamProfile: "data/samples/team-profile.json",
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
          leadDays: 10,
          startHourUtc: 8,
          durationMinutes: 75,
          location: "Meeting Room A / Google Meet draft",
          slackChannel: "#platform-team",
          emailRecipients: ["team@example.com"],
          calendarRecipients: ["engineering@example.com"]
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

    expect(sessionDraftSchema.safeParse(sessionDraft).success).toBe(true);
    expect(sessionDraft.durationMinutes).toBe(75);
    expect(sessionDraft.location).toBe("Meeting Room A / Google Meet draft");
    expect(sessionDraft.notifications.map((item) => item.channel)).toEqual(["slack", "calendar", "email"]);
  });
});
