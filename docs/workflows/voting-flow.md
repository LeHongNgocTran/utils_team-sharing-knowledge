# Voting Flow

This note explains how the voting step runs in the current skeleton project.

## Overview

```text
RankedTopicList
-> choose voting provider from config
-> load votes from configured source
-> map external data into VoteRecord[]
-> filter votes by valid topic ids
-> total scores per topic
-> choose highest-score topic
-> build TopicSelectionResult
-> write selected-topic artifact
-> continue workflow
```

## Step By Step

### 1. Orchestrator enters the voting step

File: `apps/orchestrator/src/index.ts`

The workflow step is:

```text
export-voting-and-select-topic
```

It runs only after `rankedTopics` already exists.

Input to the module:
- `RankedTopicList`
- `ModuleExecutionContext`

Output from the module:
- `TopicSelectionResult`

### 2. Provider is selected from config

The orchestrator resolves the voting provider from the provider registry.

Possible current provider modes:
- `mock`
- `real`

Examples:
- `configs/default.json` uses `mock`
- `configs/voting-google-forms.json` uses `real`
- `configs/voting-slack.json` uses `real`

### 3. Voting provider loads raw vote data

File: `packages/voting-module/src/index.ts`

The provider reads one configured source:

- `vote-records-json`
- `google-forms-json`
- `google-forms-csv`
- `slack-json`

This keeps Google Forms or Slack integration outside the orchestrator.

### 4. Raw vote data is mapped into shared schema

All external vote rows are converted into:

```text
VoteRecord[]
```

Each vote record must contain:
- `memberId`
- `topicId`
- `score`
- optional `reason`

If the source data cannot map into this contract, the provider fails early.

### 5. Votes are filtered against valid topic ids

The voting module compares incoming `topicId` values against the topic ids present in `RankedTopicList`.

That means:
- votes for valid topics are kept
- votes for unknown topics are ignored

This prevents stale or malformed vote data from breaking selection.

### 6. Vote totals are calculated

The module sums score values per topic:

```text
topicId -> total score
```

Example:

```text
topic-api-contracts -> 6
topic-risk-based-testing -> 2
```

### 7. Winner and runner-ups are chosen

Selection logic:
- choose the topic with the highest total vote score
- if no valid votes exist, fall back to the top-ranked topic
- keep the next topics as `runnerUps`

### 8. TopicSelectionResult is returned

The module returns:
- `selectedTopic`
- `voteRecords`
- `voteTotals`
- `runnerUps`
- `selectionReason`

This object is validated with the shared schema before it returns to the orchestrator.

### 9. Orchestrator writes artifact and continues

The orchestrator writes:

```text
data/outputs/<runId>/selected-topic.json
```

Then the workflow continues to:

```text
generate-topic-brief
-> generate-slide-outline
-> create-session-draft
-> simulate-feedback
-> evaluate-session
```

## Current Source Examples

Google Forms CSV sample:
- `data/samples/google-forms-votes.csv`

Slack JSON sample:
- `data/samples/slack-votes.json`

Config examples:
- `configs/voting-google-forms.json`
- `configs/voting-slack.json`

## Practical Meaning

The current implementation does not call Google Forms API or Slack API directly.

Instead, it already supports the integration boundary your teammates need:
- export vote data from Google Forms or Slack
- map that export into the shared voting flow
- let the rest of the workflow continue unchanged
