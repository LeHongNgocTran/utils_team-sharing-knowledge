# Memory Module

Acknowledges and later persists workflow artifacts.

Input: `ArtifactReference[]`

Output: `MemorySaveResult`

Providers:
- `MockMemoryProvider`: validates artifact references and returns a save acknowledgement.
- `RealMemoryProvider`: placeholder for DB, vector store, document repository, or internal knowledge base.

Integration rule: memory should index artifacts without changing the original artifact files.
