import {
  type ArtifactReference,
  artifactReferenceSchema,
  type MemorySaveResult,
  memorySaveResultSchema,
  type ModuleExecutionContext
} from "@tsa/schemas";

export interface MemoryProvider {
  saveArtifacts(artifacts: ArtifactReference[], context: ModuleExecutionContext): Promise<MemorySaveResult>;
}

export class MockMemoryProvider implements MemoryProvider {
  async saveArtifacts(artifacts: ArtifactReference[], _context: ModuleExecutionContext): Promise<MemorySaveResult> {
    const validArtifacts = artifacts.map((artifact) => artifactReferenceSchema.parse(artifact));

    return memorySaveResultSchema.parse({
      status: "saved",
      savedArtifactCount: validArtifacts.length,
      notes: "Mock memory provider acknowledged artifacts. Real memory can index these into DB, vector store, or knowledge base later."
    });
  }
}

export class RealMemoryProvider implements MemoryProvider {
  async saveArtifacts(_artifacts: ArtifactReference[], _context: ModuleExecutionContext): Promise<MemorySaveResult> {
    throw new Error("RealMemoryProvider is not implemented. Replace it with database, vector store, or document repository persistence.");
  }
}
