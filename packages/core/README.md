# Core Package

Workflow primitives for the skeleton project:
- `ArtifactWriter` writes step outputs to `data/outputs/<runId>`.
- `WorkflowRunner` executes registered steps in order and records a run summary.
- `getProvider` resolves providers from config-selected provider kinds.

The core package has no AI or product-specific module logic. Modules own their own behavior, and the orchestrator wires them together.
