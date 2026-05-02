import { describe, expect, it } from "vitest";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockSlideProvider } from "@tsa/slide-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { RealContentProvider } from "@tsa/content-module";
import { GoogleWorkspaceSchedulingProvider } from "@tsa/scheduling-module";
import { RealVotingProvider } from "@tsa/voting-module";
import { sessionDraftSchema } from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

describe("google workspace scheduling provider", () => {
  it("creates a schema-valid dry-run booking draft", async () => {
    const context = createTestContext({
      providerSelections: {
        profile: "mock",
        gapAnalysis: "mock",
        topicGeneration: "mock",
        topicRanking: "mock",
        voting: "real",
        content: "real",
        slide: "mock",
        scheduling: "google-workspace",
        feedback: "mock",
        evaluation: "mock",
        memory: "mock"
      },
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
          fixedStartAt: "2026-05-15T08:00:00.000Z",
          durationMinutes: 75,
          location: "Training Room 2 - Floor 5",
          slackChannel: "#platform-team"
        },
        googleWorkspace: {
          organizerEmail: "team-sharing-organizer@example.com",
          delegatedUser: "team-sharing-organizer@example.com",
          serviceAccountEmail: "tsa-bot@example-project.iam.gserviceaccount.com",
          privateKeyEnv: "GOOGLE_PRIVATE_KEY",
          calendarId: "primary",
          timeZone: "Asia/Ho_Chi_Minh",
          createMeetLink: true,
          sendCalendarUpdates: "all",
          sendTopicAnnouncementEmail: true,
          sendConfirmationEmail: true,
          dryRun: true,
          roomResourceCalendar: "training-room-2@resource.example.com"
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
    const sessionDraft = await new GoogleWorkspaceSchedulingProvider().createSessionDraft({ brief, slideOutline }, context);

    expect(sessionDraftSchema.safeParse(sessionDraft).success).toBe(true);
    expect(sessionDraft.externalBooking?.provider).toBe("google-workspace");
    expect(sessionDraft.externalBooking?.status).toBe("draft");
    expect(sessionDraft.externalBooking?.attendeeEmails).toHaveLength(2);
    expect(sessionDraft.scheduledFor).toBe("2026-05-15T08:00:00.000Z");
    expect(sessionDraft.location).toBe("Training Room 2 - Floor 5");
  });
});
