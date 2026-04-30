import { describe, expect, it } from "vitest";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { RealVotingProvider } from "@tsa/voting-module";
import { RealContentProvider } from "@tsa/content-module";
import { sessionBriefSchema } from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

describe("real content provider", () => {
  it("creates a schema-valid session brief from a real voting selection", async () => {
    const baseContext = createTestContext();
    const teamProfile = await new MockProfileProvider().loadTeamProfile(baseContext);
    const gapAnalysis = await new MockGapAnalysisProvider().analyze(teamProfile, baseContext);
    const topicGeneration = await new MockTopicGenerationProvider().generate(gapAnalysis, baseContext);
    const rankedTopics = await new MockTopicRankingProvider().rank({ topicGeneration, gapAnalysis }, baseContext);

    const votingContext = createTestContext({
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
          callToAction: "Pick one practice to trial next sprint."
        }
      }
    });

    const selection = await new RealVotingProvider().selectTopic(rankedTopics, votingContext);
    const brief = await new RealContentProvider().createBrief(selection, votingContext);

    expect(sessionBriefSchema.safeParse(brief).success).toBe(true);
    expect(brief.topicId).toBe(selection.selectedTopic.id);
    expect(brief.agenda.items).toHaveLength(4);
    expect(brief.agenda.items.reduce((sum, item) => sum + item.durationMinutes, 0)).toBe(55);
  });
});
