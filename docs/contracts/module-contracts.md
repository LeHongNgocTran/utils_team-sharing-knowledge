# Module Contracts

All contracts are implemented as Zod schemas in `packages/schemas/src/index.ts`.

| Module | Input | Output |
| --- | --- | --- |
| Profile | `ModuleExecutionContext` | `TeamProfile` |
| Gap Analysis | `TeamProfile` | `GapAnalysisResult` |
| Topic Generation | `GapAnalysisResult` | `TopicGenerationResult` |
| Topic Ranking | `TopicGenerationResult`, `GapAnalysisResult` | `RankedTopicList` |
| Voting | `RankedTopicList` | `TopicSelectionResult` |
| Content Preparation | `TopicSelectionResult` | `SessionBrief` |
| Slide Draft | `SessionBrief` | `SlideOutline` |
| Scheduling | `SessionBrief`, `SlideOutline` | `SessionDraft` |
| Feedback | `SessionDraft` | `FeedbackSummary` |
| Evaluation | `TopicSelectionResult`, `FeedbackSummary` | `EvaluationResult` |
| Memory | `ArtifactReference[]` | `MemorySaveResult` |

ç## Contract Rules

- Validate input at provider boundaries when data comes from external systems.
- Validate output before returning to orchestrator.
- Keep stable ids for topics, gaps, sessions, and artifacts.
- Add schema changes intentionally because they affect other teams.

## Workflow Mapping

1. `Profile` loads a schema-valid `TeamProfile`.
2. `Gap Analysis` turns team capabilities and pain points into `GapAnalysisResult`.
3. `Topic Generation` produces schema-valid topic cards from gaps.
4. `Topic Ranking` scores topics and preserves explainable ranking rationale.
5. `Voting` selects one topic and preserves vote audit data.
6. `Content Preparation` creates a reviewable `SessionBrief`.
7. `Slide Draft` turns the brief into `SlideOutline`.
8. `Scheduling` packages the brief and slides into a `SessionDraft`.
9. `Feedback` summarizes post-session signals into `FeedbackSummary`.
10. `Evaluation` produces a normalized `EvaluationResult`.
11. `Memory` acknowledges and later indexes artifacts without mutating them.

## Stability Notes

- `relatedGapIds`, `topicId`, `sessionId`, and artifact paths are cross-module references. Keep them stable.
- `EvaluationResult.outcome` is intentionally enum-based so ranking and memory can learn from consistent values.
- `NotificationDraft` stays draft-only in the skeleton. Real sending belongs behind provider implementations and future review checkpoints.
- `ModuleExecutionContext` is orchestration metadata, not a place for ad hoc business payloads.

## Ownership Boundaries

- `packages/schemas`: only shared contracts and types.
- `packages/*-module`: provider interface, mock provider, real placeholder, local README.
- `packages/core`: workflow runner, artifact writing, provider lookup.
- `apps/orchestrator`: step order, provider selection, checkpoint hooks.

## Change Policy

Before changing a schema shared across modules:

1. Update the schema in `packages/schemas/src/index.ts`.
2. Update this contract document and the example payloads in `docs/contracts/module-examples.md`.
3. Check every affected module README.
4. Run `npm run build`, `npm test`, and `npm run workflow:mock`.
