# Orchestrator App

Runs the mock end-to-end workflow:

```bash
npm run workflow:mock
```

Current flow:
1. Load team profiles
2. Analyze knowledge gaps
3. Generate topics
4. Rank topics
5. Simulate voting and select topic
6. Generate topic brief
7. Generate slide outline
8. Create session draft
9. Simulate feedback
10. Evaluate session
11. Save artifacts through memory module

Provider selection is controlled by `configs/default.json`.
