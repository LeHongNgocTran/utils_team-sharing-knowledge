# Mock End-to-End Workflow

Run:

```bash
npm run workflow:mock
```

Expected outputs:
- `team-profile.json`
- `knowledge-gaps.json`
- `generated-topics.json`
- `ranked-topics.json`
- `selected-topic.json`
- `topic-brief.json`
- `slide-outline.json`
- `session-draft.json`
- `feedback-summary.json`
- `evaluation-result.json`
- `memory-save-result.json`
- `run-summary.json`

The mock workflow is deterministic except for run id and scheduled date. It is intended for integration testing and handoff, not production decision-making.

Related workflow note:
- `docs/workflows/voting-flow.md`
