import {
  type ModuleExecutionContext,
  type RankedTopicList,
  rankedTopicListSchema,
  type TopicSelectionResult,
  topicSelectionResultSchema,
  type VoteRecord,
  voteRecordSchema
} from "@tsa/schemas";
import { readJsonFile } from "@tsa/shared";

export interface VotingProvider {
  selectTopic(rankedTopics: RankedTopicList, context: ModuleExecutionContext): Promise<TopicSelectionResult>;
}

type ConfigWithSamples = {
  sampleData?: {
    votes?: string;
  };
};

export class MockVotingProvider implements VotingProvider {
  async selectTopic(rankedTopics: RankedTopicList, context: ModuleExecutionContext): Promise<TopicSelectionResult> {
    const validRankedTopics = rankedTopicListSchema.parse(rankedTopics);
    const config = context.config as ConfigWithSamples;
    const votesPath = config.sampleData?.votes ?? "data/samples/votes.json";
    const votes = (await readJsonFile<unknown[]>(votesPath)).map((vote) => voteRecordSchema.parse(vote));
    const validTopicIds = new Set(validRankedTopics.items.map((item) => item.topic.id));
    const voteRecords = votes.filter((vote) => validTopicIds.has(vote.topicId));
    const voteTotals = this.totalVotes(voteRecords);
    const selectedTopicId = Object.entries(voteTotals).sort((left, right) => right[1] - left[1])[0]?.[0]
      ?? validRankedTopics.items[0].topic.id;
    const selectedTopic = validRankedTopics.items.find((item) => item.topic.id === selectedTopicId)?.topic
      ?? validRankedTopics.items[0].topic;
    const runnerUps = validRankedTopics.items
      .map((item) => item.topic)
      .filter((topic) => topic.id !== selectedTopic.id)
      .slice(0, 2);

    return topicSelectionResultSchema.parse({
      selectedTopic,
      voteRecords,
      voteTotals,
      runnerUps,
      selectionReason: "Mock selection chose the highest vote total, falling back to top-ranked topic if votes are absent."
    });
  }

  private totalVotes(votes: VoteRecord[]): Record<string, number> {
    return votes.reduce<Record<string, number>>((totals, vote) => {
      totals[vote.topicId] = (totals[vote.topicId] ?? 0) + vote.score;
      return totals;
    }, {});
  }
}

export class RealVotingProvider implements VotingProvider {
  async selectTopic(): Promise<TopicSelectionResult> {
    throw new Error("RealVotingProvider is not implemented. Replace it with Slack, Forms, email, or CLI voting integration.");
  }
}
