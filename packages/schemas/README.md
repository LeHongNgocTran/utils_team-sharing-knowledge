# Schemas Package

Shared Zod schemas and TypeScript types for the AI Team Sharing Assistant.

Rules:
- All module input and output data must validate against schemas from this package.
- Module-specific providers may add internal fields, but orchestrator artifacts should use shared schemas.
- Schema changes should be treated as contract changes and reviewed before module implementation work continues.
