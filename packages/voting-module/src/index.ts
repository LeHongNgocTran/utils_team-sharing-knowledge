import {
  type ModuleExecutionContext,
  type RankedTopicList,
  rankedTopicListSchema,
  type TopicSelectionResult,
  topicSelectionResultSchema,
  type VoteRecord,
  voteRecordSchema
} from "@tsa/schemas";
import { readJsonFile, readTextFile } from "@tsa/shared";

export interface VotingProvider {
  selectTopic(rankedTopics: RankedTopicList, context: ModuleExecutionContext): Promise<TopicSelectionResult>;
}

type VoteSourceType = "vote-records-json" | "google-forms-json" | "google-forms-csv" | "slack-json";

type ConfigWithSamples = {
  sampleData?: {
    votes?: string;
  };
  voting?: {
    sourceType?: VoteSourceType;
    filePath?: string;
    googleForms?: {
      memberIdField?: string;
      topicIdField?: string;
      scoreField?: string;
      reasonField?: string;
    };
    slack?: {
      memberIdField?: string;
      topicIdField?: string;
      scoreField?: string;
      reasonField?: string;
      defaultScore?: number;
    };
  };
};

export class MockVotingProvider implements VotingProvider {
  async selectTopic(rankedTopics: RankedTopicList, context: ModuleExecutionContext): Promise<TopicSelectionResult> {
    const validRankedTopics = rankedTopicListSchema.parse(rankedTopics);
    const config = context.config as ConfigWithSamples;
    const votesPath = config.sampleData?.votes ?? "data/samples/votes.json";
    const votes = (await readJsonFile<unknown[]>(votesPath)).map((vote) => voteRecordSchema.parse(vote));
    return buildTopicSelection(validRankedTopics, votes, "Mock selection chose the highest vote total, falling back to top-ranked topic if votes are absent.");
  }
}

export class RealVotingProvider implements VotingProvider {
  async selectTopic(rankedTopics: RankedTopicList, context: ModuleExecutionContext): Promise<TopicSelectionResult> {
    const validRankedTopics = rankedTopicListSchema.parse(rankedTopics);
    const config = context.config as ConfigWithSamples;
    const voteConfig = config.voting ?? {};
    const sourceType = voteConfig.sourceType ?? "vote-records-json";
    const filePath = voteConfig.filePath ?? config.sampleData?.votes ?? "data/samples/votes.json";
    const votes = await readVotesFromSource(sourceType, filePath, voteConfig);
    const selectionReason = sourceType === "slack-json"
      ? "RealVotingProvider mapped Slack vote export into shared vote records and selected the highest vote total."
      : sourceType.startsWith("google-forms")
        ? "RealVotingProvider mapped Google Forms responses into shared vote records and selected the highest vote total."
        : "RealVotingProvider used shared vote records from a configured file and selected the highest vote total.";

    return buildTopicSelection(validRankedTopics, votes, selectionReason);
  }
}

function buildTopicSelection(
  rankedTopics: RankedTopicList,
  votes: VoteRecord[],
  selectionReason: string
): TopicSelectionResult {
  const validTopicIds = new Set(rankedTopics.items.map((item) => item.topic.id));
  const voteRecords = votes.filter((vote) => validTopicIds.has(vote.topicId));
  const voteTotals = totalVotes(voteRecords);
  const selectedTopicId = Object.entries(voteTotals).sort((left, right) => right[1] - left[1])[0]?.[0]
    ?? rankedTopics.items[0].topic.id;
  const selectedTopic = rankedTopics.items.find((item) => item.topic.id === selectedTopicId)?.topic
    ?? rankedTopics.items[0].topic;
  const runnerUps = rankedTopics.items
    .map((item) => item.topic)
    .filter((topic) => topic.id !== selectedTopic.id)
    .slice(0, 2);

  return topicSelectionResultSchema.parse({
    selectedTopic,
    voteRecords,
    voteTotals,
    runnerUps,
    selectionReason
  });
}

function totalVotes(votes: VoteRecord[]): Record<string, number> {
  return votes.reduce<Record<string, number>>((totals, vote) => {
    totals[vote.topicId] = (totals[vote.topicId] ?? 0) + vote.score;
    return totals;
  }, {});
}

async function readVotesFromSource(
  sourceType: VoteSourceType,
  filePath: string,
  config: NonNullable<ConfigWithSamples["voting"]>
): Promise<VoteRecord[]> {
  switch (sourceType) {
    case "google-forms-csv":
      return parseGoogleFormsRows(parseCsv(await readTextFile(filePath)), config.googleForms);
    case "google-forms-json":
      return parseGoogleFormsObjects(await readJsonFile<unknown[]>(filePath), config.googleForms);
    case "slack-json":
      return parseSlackObjects(await readJsonFile<unknown[]>(filePath), config.slack);
    case "vote-records-json":
    default:
      return (await readJsonFile<unknown[]>(filePath)).map((vote) => voteRecordSchema.parse(vote));
  }
}

function parseGoogleFormsObjects(
  rows: unknown[],
  config: NonNullable<ConfigWithSamples["voting"]>["googleForms"] = {}
): VoteRecord[] {
  const memberIdField = config.memberIdField ?? "memberId";
  const topicIdField = config.topicIdField ?? "topicId";
  const scoreField = config.scoreField ?? "score";
  const reasonField = config.reasonField ?? "reason";

  return rows.map((row) => {
    if (!row || typeof row !== "object") {
      throw new Error("Google Forms JSON rows must be objects.");
    }

    const record = row as Record<string, unknown>;
    return voteRecordSchema.parse({
      memberId: toRequiredString(record[memberIdField], memberIdField),
      topicId: toRequiredString(record[topicIdField], topicIdField),
      score: toVoteScore(record[scoreField], scoreField),
      reason: toOptionalString(record[reasonField])
    });
  });
}

function parseGoogleFormsRows(
  csvRows: string[][],
  config: NonNullable<ConfigWithSamples["voting"]>["googleForms"] = {}
): VoteRecord[] {
  if (csvRows.length < 2) {
    return [];
  }

  const [headerRow, ...dataRows] = csvRows;
  const headerIndex = new Map(headerRow.map((column, index) => [column.trim(), index]));
  const memberIdField = config.memberIdField ?? "memberId";
  const topicIdField = config.topicIdField ?? "topicId";
  const scoreField = config.scoreField ?? "score";
  const reasonField = config.reasonField ?? "reason";

  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) =>
      voteRecordSchema.parse({
        memberId: toRequiredString(row[headerIndex.get(memberIdField) ?? -1], memberIdField),
        topicId: toRequiredString(row[headerIndex.get(topicIdField) ?? -1], topicIdField),
        score: toVoteScore(row[headerIndex.get(scoreField) ?? -1], scoreField),
        reason: toOptionalString(row[headerIndex.get(reasonField) ?? -1])
      })
    );
}

function parseSlackObjects(
  rows: unknown[],
  config: NonNullable<ConfigWithSamples["voting"]>["slack"] = {}
): VoteRecord[] {
  const memberIdField = config.memberIdField ?? "userId";
  const topicIdField = config.topicIdField ?? "topicId";
  const scoreField = config.scoreField ?? "score";
  const reasonField = config.reasonField ?? "reason";
  const defaultScore = config.defaultScore ?? 1;

  return rows.map((row) => {
    if (!row || typeof row !== "object") {
      throw new Error("Slack vote rows must be objects.");
    }

    const record = row as Record<string, unknown>;
    return voteRecordSchema.parse({
      memberId: toRequiredString(record[memberIdField], memberIdField),
      topicId: toRequiredString(record[topicIdField], topicIdField),
      score: record[scoreField] === undefined ? defaultScore : toVoteScore(record[scoreField], scoreField),
      reason: toOptionalString(record[reasonField])
    });
  });
}

function toRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required vote field "${fieldName}".`);
  }

  return value.trim();
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toVoteScore(value: unknown, fieldName: string): number {
  const numeric = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 3) {
    throw new Error(`Vote field "${fieldName}" must be an integer from 1 to 3.`);
  }

  return numeric;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}
