import { describe, expect, it } from "vitest";
import {
  memberProfileSchema,
  teamProfileSchema,
  topicCardSchema,
  voteRecordSchema
} from "@tsa/schemas";

describe("schema contracts", () => {
  it("validates a correct team profile", () => {
    const result = teamProfileSchema.safeParse({
      id: "team-1",
      name: "Team",
      description: "A team profile",
      members: [
        {
          id: "member-1",
          name: "Member One",
          role: "Engineer",
          level: "mid",
          skills: [{ name: "Testing", category: "technical", level: 3 }],
          developmentGoals: [{ title: "Improve test design", priority: "high" }],
          painPoints: [],
          interests: []
        }
      ],
      teamGoals: ["Improve sharing"]
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid member level and skill level", () => {
    const result = memberProfileSchema.safeParse({
      id: "member-1",
      name: "Member One",
      role: "Engineer",
      level: "expert",
      skills: [{ name: "Testing", category: "technical", level: 6 }],
      developmentGoals: [{ title: "Improve test design", priority: "high" }]
    });

    expect(result.success).toBe(false);
  });

  it("rejects topic cards without required context", () => {
    const result = topicCardSchema.safeParse({
      id: "topic-1",
      title: "Missing Context"
    });

    expect(result.success).toBe(false);
  });

  it("rejects vote scores outside the contract", () => {
    const result = voteRecordSchema.safeParse({
      memberId: "member-1",
      topicId: "topic-1",
      score: 5
    });

    expect(result.success).toBe(false);
  });
});
