import { describe, expect, it } from "vitest";
import { MockGapAnalysisProvider } from "@tsa/gap-analysis-module";
import { MockProfileProvider } from "@tsa/profile-module";
import { MockTopicGenerationProvider } from "@tsa/topic-generation-module";
import { MockTopicRankingProvider } from "@tsa/topic-ranking-module";
import { RealVotingProvider } from "@tsa/voting-module";
import { topicSelectionResultSchema } from "@tsa/schemas";
import { createTestContext } from "../test-context.js";

async function buildRankedTopics() {
  const baseContext = createTestContext();
  const teamProfile = await new MockProfileProvider().loadTeamProfile(baseContext);
  const gapAnalysis = await new MockGapAnalysisProvider().analyze(teamProfile, baseContext);
  const topicGeneration = await new MockTopicGenerationProvider().generate(gapAnalysis, baseContext);
  return new MockTopicRankingProvider().rank({ topicGeneration, gapAnalysis }, baseContext);
}

describe("voting connectors", () => {
  it("maps Google Forms CSV into the shared voting flow", async () => {
    const rankedTopics = await buildRankedTopics();
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
        }
      }
    });

    const result = await new RealVotingProvider().selectTopic(rankedTopics, context);
    expect(topicSelectionResultSchema.safeParse(result).success).toBe(true);
    expect(result.selectedTopic.id).toBe("topic-api-contracts");
    expect(result.voteRecords).toHaveLength(3);
  });

  it("maps Slack export JSON into the shared voting flow", async () => {
    const rankedTopics = await buildRankedTopics();
    const context = createTestContext({
      config: {
        sampleData: {
          teamProfile: "data/samples/team-profile.json",
          votes: "data/samples/votes.json",
          feedback: "data/samples/feedback.json"
        },
        voting: {
          sourceType: "slack-json",
          filePath: "data/samples/slack-votes.json"
        }
      }
    });

    const result = await new RealVotingProvider().selectTopic(rankedTopics, context);
    expect(topicSelectionResultSchema.safeParse(result).success).toBe(true);
    expect(result.selectedTopic.id).toBe("topic-api-contracts");
    expect(result.voteRecords[0]?.memberId).toBe("member-anh");
  });
});
