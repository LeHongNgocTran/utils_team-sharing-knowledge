# Module Integration Guide

Use this guide when replacing a mock provider with a real implementation.

## Checklist

1. Read the module README in `packages/<module-name>/README.md`.
2. Confirm the input and output schemas in `packages/schemas/src/index.ts`.
3. Implement the existing provider interface.
4. Validate external data before converting it into shared schemas.
5. Return only schema-valid output to the orchestrator.
6. Register the provider in `apps/orchestrator/src/index.ts`.
7. Switch `configs/default.json` for that module only.
8. Add tests covering valid input, empty/minimal input, and invalid external data.
9. Run `npm run build`, `npm test`, and `npm run workflow:mock`.

## Per-Module Handoff Checklist

### Profile + Gap Analysis

- Confirm how source data is collected: form, sheet, HR system, or internal database.
- Normalize skills, goals, and pain points before mapping to shared schemas.
- Keep gap ids stable because downstream topic generation depends on them.

### Topic Generation + Ranking

- Generate topic cards with all required fields, not titles only.
- Preserve `relatedGapIds` so ranking and evaluation remain explainable.
- Keep ranking rationale human-readable for future review checkpoints.

### Voting + Scheduling + Feedback + Evaluation

- Keep external sending behind provider logic; the orchestrator should still see drafts and summaries only.
- Preserve vote records and feedback entries for auditability.
- Map evaluation outcomes to the shared enum exactly.

### Content + Slide

- Treat output as draft material for human review, not final approved training content.
- Keep `topicId` and titles aligned with the selection result to avoid orphan artifacts.

### Memory

- Index artifacts by reference.
- Do not rewrite or mutate files already written under `data/outputs`.

## Handoff Notes

- Profile + Gap Analysis can be implemented together because profile quality affects gap quality.
- Topic Generation + Ranking should keep topic ids stable for voting and memory.
- Content + Slide should stay draft-oriented until human review is added.
- Voting + Scheduling + Feedback + Evaluation should avoid sending real notifications until approval checkpoints exist.
- Memory should index artifacts but not mutate original output files.

## Team Split Suggestion

- Engineer 1: Profile Module + Gap Analysis Module
- Engineer 2: Topic Generation Module + Topic Ranking Module
- Engineer 3: Content Module + Slide Module
- Engineer 4: Voting Module + Scheduling Module + Feedback Module + Evaluation Module
- Project owner: Orchestrator, schemas, provider registry, integration review, final merge
