import { access, readFile, rm } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { runMockWorkflow } from "../../apps/orchestrator/src/index.js";

describe("mock workflow", () => {
  it("runs end-to-end and writes artifacts", async () => {
    await rm("data/outputs", { recursive: true, force: true });

    const { workflowRun, state } = await runMockWorkflow();

    expect(workflowRun.status).toBe("success");
    expect(workflowRun.steps).toHaveLength(11);
    expect(state.evaluationResult?.outcome).toBe("continue-series");

    const expectedArtifacts = [
      "team-profile.json",
      "knowledge-gaps.json",
      "generated-topics.json",
      "ranked-topics.json",
      "selected-topic.json",
      "topic-brief.json",
      "slide-outline.json",
      "session-draft.json",
      "feedback-summary.json",
      "evaluation-result.json",
      "memory-save-result.json",
      "run-summary.json"
    ];

    for (const artifactName of expectedArtifacts) {
      await access(`data/outputs/${workflowRun.runId}/${artifactName}`);
    }

    const summary = JSON.parse(await readFile(`data/outputs/${workflowRun.runId}/run-summary.json`, "utf8"));
    expect(summary.status).toBe("success");
  });

  it("preserves module-specific config when running real voting, content, and scheduling providers", async () => {
    await rm("data/outputs", { recursive: true, force: true });

    const { workflowRun, state } = await runMockWorkflow("configs/voting-google-forms-content-scheduling.json");

    expect(workflowRun.status).toBe("success");
    expect(state.topicSelection?.selectionReason).toContain("Google Forms");
    expect(state.sessionBrief?.agenda.items.reduce((sum, item) => sum + item.durationMinutes, 0)).toBe(55);
    expect(state.sessionDraft?.durationMinutes).toBe(75);
    expect(state.sessionDraft?.location).toBe("Meeting Room A / Google Meet draft");
    expect(state.sessionDraft?.notifications.map((item) => item.channel)).toEqual(["slack", "calendar", "email"]);
  });
});
