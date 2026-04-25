# Profile Module

Loads and validates team profile data.

Input: `ModuleExecutionContext`

Output: `TeamProfile`

Providers:
- `MockProfileProvider`: reads `data/samples/team-profile.json`.
- `RealProfileProvider`: placeholder for Forms, Sheets, HRIS, or internal profile source.

Integration rule: return a schema-valid `TeamProfile`; do not leak source-specific fields into the orchestrator.
