# Architecture Overview

This repo is a master skeleton for AI Team Sharing Assistant.

Core design:
- `packages/schemas` owns cross-module contracts.
- `packages/*-module` owns provider interfaces and implementations.
- `apps/orchestrator` wires providers into a fixed workflow.
- `packages/core` runs workflow steps and writes artifacts.
- `data/outputs` stores run artifacts for review and future memory indexing.

The architecture is intentionally modular but not microservice-based. Providers can later call external APIs, CLIs, agents, or rule engines without changing the orchestrator contract.

## Review Checkpoints

`configs/default.json` includes placeholder checkpoints:

- `topicRanking`
- `topicSelection`
- `contentGeneration`
- `schedulingDraft`
- `evaluationResult`

They are currently disabled. When enabled, the runner calls `onCheckpoint`, which can later pause for human review, approval, or editing.
