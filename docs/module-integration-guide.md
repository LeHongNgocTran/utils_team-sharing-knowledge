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

## Handoff Notes

- Profile + Gap Analysis can be implemented together because profile quality affects gap quality.
- Topic Generation + Ranking should keep topic ids stable for voting and memory.
- Content + Slide should stay draft-oriented until human review is added.
- Voting + Scheduling + Feedback + Evaluation should avoid sending real notifications until approval checkpoints exist.
- Memory should index artifacts but not mutate original output files.
