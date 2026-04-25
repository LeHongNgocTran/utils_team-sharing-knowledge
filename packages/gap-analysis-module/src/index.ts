import {
  type GapAnalysisResult,
  gapAnalysisResultSchema,
  type ModuleExecutionContext,
  type TeamProfile,
  teamProfileSchema
} from "@tsa/schemas";

export interface GapAnalysisProvider {
  analyze(teamProfile: TeamProfile, context: ModuleExecutionContext): Promise<GapAnalysisResult>;
}

export class MockGapAnalysisProvider implements GapAnalysisProvider {
  async analyze(teamProfile: TeamProfile, _context: ModuleExecutionContext): Promise<GapAnalysisResult> {
    const validTeam = teamProfileSchema.parse(teamProfile);
    const painPoints = validTeam.members.flatMap((member) => member.painPoints);

    const result: GapAnalysisResult = {
      teamId: validTeam.id,
      summary: `Mock analysis found recurring needs across ${validTeam.members.length} members: API clarity, observability, testability, and sharing habits.`,
      gaps: [
        {
          id: "gap-api-contracts",
          title: "API contract clarity",
          description: "Frontend and QA work can be delayed when API behavior and acceptance criteria are not explicit.",
          relatedSkills: ["API Design", "Testing", "Product Thinking"],
          priority: "high",
          evidence: painPoints.filter((point) => /api|criteria|rework/i.test(point))
        },
        {
          id: "gap-observability",
          title: "Production observability basics",
          description: "The team needs a shared baseline for logs, metrics, traces, and incident debugging.",
          relatedSkills: ["Observability", "Incident Review", "Automation"],
          priority: "high",
          evidence: painPoints.filter((point) => /incident|debug|production/i.test(point))
        },
        {
          id: "gap-risk-based-testing",
          title: "Risk-based testing and shift-left quality",
          description: "Quality risks should be identified earlier through better test planning and testability conversations.",
          relatedSkills: ["Test Planning", "Risk Analysis", "Automation"],
          priority: "medium",
          evidence: painPoints.filter((point) => /quality|test|defect/i.test(point))
        }
      ],
      recommendedFocusAreas: ["api-contracts", "observability", "testability", "technical-writing"]
    };

    return gapAnalysisResultSchema.parse(result);
  }
}

export class RealGapAnalysisProvider implements GapAnalysisProvider {
  async analyze(_teamProfile: TeamProfile, _context: ModuleExecutionContext): Promise<GapAnalysisResult> {
    throw new Error("RealGapAnalysisProvider is not implemented. Replace it with rule-based scoring, embeddings, or AI analysis.");
  }
}
