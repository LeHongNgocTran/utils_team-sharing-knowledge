# Module Contract Examples

These are lightweight example payloads to help teammates implement real providers without guessing the contract shape. The canonical source of truth remains `packages/schemas/src/index.ts`.

## Profile Module

Input: `ModuleExecutionContext`

```json
{
  "runId": "sharing-2026-04-28T08-13-18-001Z",
  "startedAt": "2026-04-28T08:13:18.001Z",
  "artifactDir": "data/outputs/sharing-2026-04-28T08-13-18-001Z",
  "providerSelections": {
    "profile": "mock"
  },
  "config": {
    "runMode": "mock"
  }
}
```

Output: `TeamProfile`

```json
{
  "id": "team-platform",
  "name": "Platform Team",
  "description": "Builds shared internal systems and delivery tooling.",
  "members": [
    {
      "id": "m-001",
      "name": "Linh Tran",
      "role": "Backend Engineer",
      "level": "mid",
      "skills": [
        {
          "name": "Node.js",
          "category": "technical",
          "level": 4
        }
      ],
      "developmentGoals": [
        {
          "title": "Improve system design depth",
          "priority": "high"
        }
      ],
      "painPoints": [
        "Inconsistent API design across services"
      ],
      "interests": [
        "architecture review"
      ]
    }
  ],
  "teamGoals": [
    "Improve system reliability",
    "Share reusable engineering practices"
  ]
}
```

## Gap Analysis Module

Input: `TeamProfile`

Output: `GapAnalysisResult`

```json
{
  "teamId": "team-platform",
  "summary": "The team needs stronger shared practices around reliability and API design.",
  "gaps": [
    {
      "id": "gap-api-consistency",
      "title": "API consistency and contract governance",
      "description": "Different services follow different conventions.",
      "relatedSkills": [
        "API design",
        "service contracts"
      ],
      "priority": "high",
      "evidence": [
        "Repeated pain point in profile data",
        "Cross-team integration friction"
      ]
    }
  ],
  "recommendedFocusAreas": [
    "service contracts",
    "reliability"
  ]
}
```

## Topic Generation Module

Input: `GapAnalysisResult`

Output: `TopicGenerationResult`

```json
{
  "topics": [
    {
      "id": "topic-api-contracts",
      "title": "Practical API Contract Governance for Growing Teams",
      "overview": "How to align service APIs without slowing delivery.",
      "background": "The team has recurring integration friction across services.",
      "whyNow": "The current roadmap increases cross-service dependencies.",
      "targetAudience": [
        "backend",
        "platform"
      ],
      "difficulty": "intermediate",
      "expectedImpact": "Reduce rework and improve service integration quality.",
      "relatedGapIds": [
        "gap-api-consistency"
      ]
    }
  ],
  "generationNotes": "Generated from the highest priority gaps and current team goals."
}
```

## Topic Ranking Module

Input: `TopicGenerationResult` plus `GapAnalysisResult`

Output: `RankedTopicList`

```json
{
  "items": [
    {
      "topic": {
        "id": "topic-api-contracts",
        "title": "Practical API Contract Governance for Growing Teams",
        "overview": "How to align service APIs without slowing delivery.",
        "background": "The team has recurring integration friction across services.",
        "whyNow": "The current roadmap increases cross-service dependencies.",
        "targetAudience": [
          "backend",
          "platform"
        ],
        "difficulty": "intermediate",
        "expectedImpact": "Reduce rework and improve service integration quality.",
        "relatedGapIds": [
          "gap-api-consistency"
        ]
      },
      "score": {
        "topicId": "topic-api-contracts",
        "relevance": 0.92,
        "difficultyFit": 0.83,
        "coverage": 0.8,
        "novelty": 0.78,
        "strategicValue": 0.9,
        "total": 0.85,
        "rationale": "Matches current delivery pain and benefits most of the team."
      },
      "rank": 1
    }
  ],
  "scoringVersion": "mock-v1"
}
```

## Voting Module

Input: `RankedTopicList`

Output: `TopicSelectionResult`

```json
{
  "selectedTopic": {
    "id": "topic-api-contracts",
    "title": "Practical API Contract Governance for Growing Teams",
    "overview": "How to align service APIs without slowing delivery.",
    "background": "The team has recurring integration friction across services.",
    "whyNow": "The current roadmap increases cross-service dependencies.",
    "targetAudience": [
      "backend",
      "platform"
    ],
    "difficulty": "intermediate",
    "expectedImpact": "Reduce rework and improve service integration quality.",
    "relatedGapIds": [
      "gap-api-consistency"
    ]
  },
  "voteRecords": [
    {
      "memberId": "m-001",
      "topicId": "topic-api-contracts",
      "score": 3,
      "reason": "Useful for current integration issues"
    }
  ],
  "voteTotals": {
    "topic-api-contracts": 9
  },
  "runnerUps": [],
  "selectionReason": "Highest vote total with strong alignment to current team pain points."
}
```

## Content Preparation Module

Input: `TopicSelectionResult`

Output: `SessionBrief`

```json
{
  "topicId": "topic-api-contracts",
  "title": "Practical API Contract Governance for Growing Teams",
  "objective": "Give the team a repeatable way to define and review service contracts.",
  "audience": [
    "backend",
    "platform"
  ],
  "keyTakeaways": [
    "How to document contracts",
    "How to review breaking changes",
    "How to keep service boundaries clear"
  ],
  "prepNotes": "Keep examples grounded in the current internal service landscape.",
  "agenda": {
    "items": [
      {
        "title": "Current pain points",
        "durationMinutes": 10,
        "notes": "Use real examples from recent integrations."
      }
    ]
  }
}
```

## Slide Draft Module

Input: `SessionBrief`

Output: `SlideOutline`

```json
{
  "topicId": "topic-api-contracts",
  "title": "Practical API Contract Governance for Growing Teams",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Why this topic now",
      "bullets": [
        "Integration friction is increasing",
        "Contract clarity reduces rework"
      ],
      "speakerNotes": "Start from team pain before introducing a framework."
    }
  ]
}
```

## Scheduling Module

Input: `SessionBrief` plus `SlideOutline`

Output: `SessionDraft`

```json
{
  "sessionId": "session-2026-05-api-contracts",
  "topicId": "topic-api-contracts",
  "title": "Practical API Contract Governance for Growing Teams",
  "scheduledFor": "2026-05-05T07:00:00.000Z",
  "durationMinutes": 45,
  "location": "Meeting Room A",
  "brief": {
    "topicId": "topic-api-contracts",
    "title": "Practical API Contract Governance for Growing Teams",
    "objective": "Give the team a repeatable way to define and review service contracts.",
    "audience": [
      "backend",
      "platform"
    ],
    "keyTakeaways": [
      "How to document contracts"
    ],
    "prepNotes": "Keep examples grounded in the current internal service landscape.",
    "agenda": {
      "items": [
        {
          "title": "Current pain points",
          "durationMinutes": 10,
          "notes": "Use real examples from recent integrations."
        }
      ]
    }
  },
  "slideOutline": {
    "topicId": "topic-api-contracts",
    "title": "Practical API Contract Governance for Growing Teams",
    "slides": [
      {
        "slideNumber": 1,
        "title": "Why this topic now",
        "bullets": [
          "Integration friction is increasing"
        ],
        "speakerNotes": "Start from team pain before introducing a framework."
      }
    ]
  },
  "notifications": [
    {
      "channel": "slack",
      "subject": "Upcoming sharing session",
      "body": "Draft announcement for the API contracts sharing session.",
      "recipients": [
        "#platform-team"
      ]
    }
  ]
}
```

## Feedback Module

Input: `SessionDraft`

Output: `FeedbackSummary`

```json
{
  "entries": [
    {
      "memberId": "m-001",
      "relevance": 5,
      "clarity": 4,
      "practicalValue": 5,
      "difficultyFit": 4,
      "continuationInterest": 5,
      "comment": "Would like a follow-up on versioning rules."
    }
  ],
  "averages": {
    "relevance": 4.7,
    "clarity": 4.3,
    "practicalValue": 4.6,
    "difficultyFit": 4.2,
    "continuationInterest": 4.5
  },
  "summary": "The topic was useful and should likely continue as a short series."
}
```

## Evaluation Module

Input: `TopicSelectionResult` plus `FeedbackSummary`

Output: `EvaluationResult`

```json
{
  "topicId": "topic-api-contracts",
  "overallScore": 4.5,
  "outcome": "continue-series",
  "findings": [
    "Strong practical value",
    "Good fit for current team needs"
  ],
  "nextTopicSuggestions": [
    {
      "title": "Versioning strategies for internal APIs",
      "reason": "Natural continuation from contract governance.",
      "priority": "high"
    }
  ]
}
```

## Memory Module

Input: `ArtifactReference[]`

Output: `MemorySaveResult`

```json
{
  "status": "saved",
  "savedArtifactCount": 12,
  "notes": "Artifacts acknowledged and ready for indexing."
}
```
