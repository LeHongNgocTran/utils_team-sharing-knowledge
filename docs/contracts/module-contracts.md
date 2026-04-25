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

## Rules

- Validate input at provider boundaries when data comes from external systems.
- Validate output before returning to orchestrator.
- Keep stable ids for topics, gaps, sessions, and artifacts.
- Add schema changes intentionally because they affect other teams.
