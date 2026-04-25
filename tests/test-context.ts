import type { ModuleExecutionContext } from "@tsa/schemas";

export function createTestContext(overrides: Partial<ModuleExecutionContext> = {}): ModuleExecutionContext {
  return {
    runId: "test-run",
    startedAt: "2026-01-01T00:00:00.000Z",
    artifactDir: "data/outputs/test-run",
    providerSelections: {
      profile: "mock",
      gapAnalysis: "mock",
      topicGeneration: "mock",
      topicRanking: "mock",
      voting: "mock",
      content: "mock",
      slide: "mock",
      scheduling: "mock",
      feedback: "mock",
      evaluation: "mock",
      memory: "mock"
    },
    config: {
      sampleData: {
        teamProfile: "data/samples/team-profile.json",
        votes: "data/samples/votes.json",
        feedback: "data/samples/feedback.json"
      }
    },
    ...overrides
  };
}
