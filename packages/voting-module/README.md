# Voting Module

Exports topics for voting conceptually, simulates votes, and selects a winning topic.

Input: `RankedTopicList`

Output: `TopicSelectionResult`

Providers:
- `MockVotingProvider`: reads `data/samples/votes.json` and selects by highest total vote score.
- `RealVotingProvider`: connector-oriented provider that can map:
  - shared `vote-records-json`
  - `google-forms-json`
  - `google-forms-csv`
  - `slack-json`

Integration rule: preserve vote records and selection rationale for auditability.

## Config Example

```json
{
  "voting": {
    "sourceType": "google-forms-csv",
    "filePath": "data/samples/google-forms-votes.csv"
  }
}
```

```json
{
  "voting": {
    "sourceType": "slack-json",
    "filePath": "data/samples/slack-votes.json",
    "slack": {
      "memberIdField": "userId",
      "topicIdField": "topicId",
      "scoreField": "score",
      "reasonField": "reason",
      "defaultScore": 1
    }
  }
}
```
