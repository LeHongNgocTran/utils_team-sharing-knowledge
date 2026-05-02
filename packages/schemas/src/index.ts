import { z } from "zod";

export const skillCategorySchema = z.enum(["technical", "soft", "business", "process", "domain"]);
export const prioritySchema = z.enum(["low", "medium", "high"]);
export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export const providerKindSchema = z.enum(["mock", "rule-based", "ai-api", "cli", "agent", "real", "google-workspace", "google-oauth-personal"]);

export const skillTagSchema = z.object({
  name: z.string().min(1),
  category: skillCategorySchema,
  level: z.number().int().min(1).max(5)
});

export const developmentGoalSchema = z.object({
  title: z.string().min(1),
  priority: prioritySchema
});

export const memberProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  role: z.string().min(1),
  level: z.enum(["intern", "junior", "mid", "senior", "lead"]),
  skills: z.array(skillTagSchema),
  developmentGoals: z.array(developmentGoalSchema),
  painPoints: z.array(z.string().min(1)).default([]),
  interests: z.array(z.string().min(1)).default([])
});

export const teamProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  members: z.array(memberProfileSchema).min(1),
  teamGoals: z.array(z.string().min(1)).default([])
});

export const knowledgeGapSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  relatedSkills: z.array(z.string().min(1)),
  priority: prioritySchema,
  evidence: z.array(z.string().min(1))
});

export const gapAnalysisResultSchema = z.object({
  teamId: z.string().min(1),
  summary: z.string().min(1),
  gaps: z.array(knowledgeGapSchema),
  recommendedFocusAreas: z.array(z.string().min(1))
});

export const topicCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  overview: z.string().min(1),
  background: z.string().min(1),
  whyNow: z.string().min(1),
  targetAudience: z.array(z.string().min(1)),
  difficulty: difficultySchema,
  expectedImpact: z.string().min(1),
  relatedGapIds: z.array(z.string().min(1))
});

export const topicGenerationResultSchema = z.object({
  topics: z.array(topicCardSchema).min(1),
  generationNotes: z.string().min(1)
});

export const topicScoreSchema = z.object({
  topicId: z.string().min(1),
  relevance: z.number().min(0).max(1),
  difficultyFit: z.number().min(0).max(1),
  coverage: z.number().min(0).max(1),
  novelty: z.number().min(0).max(1),
  strategicValue: z.number().min(0).max(1),
  total: z.number().min(0).max(1),
  rationale: z.string().min(1)
});

export const rankedTopicSchema = z.object({
  topic: topicCardSchema,
  score: topicScoreSchema,
  rank: z.number().int().min(1)
});

export const rankedTopicListSchema = z.object({
  items: z.array(rankedTopicSchema).min(1),
  scoringVersion: z.string().min(1)
});

export const voteRecordSchema = z.object({
  memberId: z.string().min(1),
  topicId: z.string().min(1),
  score: z.number().int().min(1).max(3),
  reason: z.string().min(1).optional()
});

export const topicSelectionResultSchema = z.object({
  selectedTopic: topicCardSchema,
  voteRecords: z.array(voteRecordSchema),
  voteTotals: z.record(z.number().nonnegative()),
  runnerUps: z.array(topicCardSchema),
  selectionReason: z.string().min(1)
});

export const sessionAgendaSchema = z.object({
  items: z.array(
    z.object({
      title: z.string().min(1),
      durationMinutes: z.number().int().positive(),
      notes: z.string().min(1)
    })
  ).min(1)
});

export const sessionBriefSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  audience: z.array(z.string().min(1)),
  keyTakeaways: z.array(z.string().min(1)),
  prepNotes: z.string().min(1),
  agenda: sessionAgendaSchema
});

export const slideOutlineSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),
  slides: z.array(
    z.object({
      slideNumber: z.number().int().positive(),
      title: z.string().min(1),
      bullets: z.array(z.string().min(1)).min(1),
      speakerNotes: z.string().min(1)
    })
  ).min(1)
});

export const notificationDraftSchema = z.object({
  channel: z.enum(["slack", "email", "calendar"]),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().min(1))
});

export const externalBookingSchema = z.object({
  provider: z.enum(["google-workspace", "google-oauth-personal"]),
  status: z.enum(["draft", "booked", "pending"]),
  organizerEmail: z.string().email(),
  attendeeEmails: z.array(z.string().email()).default([]),
  roomResourceEmail: z.string().email().optional(),
  calendarEventId: z.string().min(1).optional(),
  calendarHtmlLink: z.string().url().optional(),
  meetLink: z.string().url().optional(),
  candidateSlotStart: z.string().datetime().optional(),
  candidateSlotEnd: z.string().datetime().optional(),
  notes: z.array(z.string().min(1)).default([])
});

export const sessionDraftSchema = z.object({
  sessionId: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  scheduledFor: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  location: z.string().min(1),
  brief: sessionBriefSchema,
  slideOutline: slideOutlineSchema,
  notifications: z.array(notificationDraftSchema),
  externalBooking: externalBookingSchema.optional()
});

export const feedbackEntrySchema = z.object({
  memberId: z.string().min(1),
  relevance: z.number().int().min(1).max(5),
  clarity: z.number().int().min(1).max(5),
  practicalValue: z.number().int().min(1).max(5),
  difficultyFit: z.number().int().min(1).max(5),
  continuationInterest: z.number().int().min(1).max(5),
  comment: z.string().min(1).optional()
});

export const feedbackSummarySchema = z.object({
  entries: z.array(feedbackEntrySchema).min(1),
  averages: z.object({
    relevance: z.number().min(1).max(5),
    clarity: z.number().min(1).max(5),
    practicalValue: z.number().min(1).max(5),
    difficultyFit: z.number().min(1).max(5),
    continuationInterest: z.number().min(1).max(5)
  }),
  summary: z.string().min(1)
});

export const nextTopicSuggestionSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
  priority: prioritySchema
});

export const evaluationResultSchema = z.object({
  topicId: z.string().min(1),
  overallScore: z.number().min(1).max(5),
  outcome: z.enum([
    "continue-series",
    "useful-needs-improvement",
    "good-not-right-time",
    "too-basic",
    "too-advanced",
    "deprioritize"
  ]),
  findings: z.array(z.string().min(1)),
  nextTopicSuggestions: z.array(nextTopicSuggestionSchema)
});

export const artifactReferenceSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  type: z.enum(["json", "markdown"]),
  createdAt: z.string().datetime()
});

export const workflowStepResultSchema = z.object({
  stepName: z.string().min(1),
  status: z.enum(["success", "failed", "skipped"]),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  durationMs: z.number().nonnegative(),
  artifactRefs: z.array(artifactReferenceSchema),
  error: z.string().optional()
});

export const moduleExecutionContextSchema = z.object({
  runId: z.string().min(1),
  startedAt: z.string().datetime(),
  artifactDir: z.string().min(1),
  providerSelections: z.record(providerKindSchema),
  config: z.record(z.unknown())
});

export const workflowRunSchema = z.object({
  runId: z.string().min(1),
  status: z.enum(["running", "success", "failed"]),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
  steps: z.array(workflowStepResultSchema),
  artifacts: z.array(artifactReferenceSchema),
  summary: z.string().optional()
});

export const memorySaveResultSchema = z.object({
  status: z.enum(["saved", "skipped"]),
  savedArtifactCount: z.number().int().nonnegative(),
  notes: z.string().min(1)
});

export type SkillTag = z.infer<typeof skillTagSchema>;
export type DevelopmentGoal = z.infer<typeof developmentGoalSchema>;
export type MemberProfile = z.infer<typeof memberProfileSchema>;
export type TeamProfile = z.infer<typeof teamProfileSchema>;
export type KnowledgeGap = z.infer<typeof knowledgeGapSchema>;
export type GapAnalysisResult = z.infer<typeof gapAnalysisResultSchema>;
export type TopicCard = z.infer<typeof topicCardSchema>;
export type TopicGenerationResult = z.infer<typeof topicGenerationResultSchema>;
export type TopicScore = z.infer<typeof topicScoreSchema>;
export type RankedTopicList = z.infer<typeof rankedTopicListSchema>;
export type VoteRecord = z.infer<typeof voteRecordSchema>;
export type TopicSelectionResult = z.infer<typeof topicSelectionResultSchema>;
export type SessionAgenda = z.infer<typeof sessionAgendaSchema>;
export type SessionBrief = z.infer<typeof sessionBriefSchema>;
export type SlideOutline = z.infer<typeof slideOutlineSchema>;
export type NotificationDraft = z.infer<typeof notificationDraftSchema>;
export type ExternalBooking = z.infer<typeof externalBookingSchema>;
export type SessionDraft = z.infer<typeof sessionDraftSchema>;
export type FeedbackEntry = z.infer<typeof feedbackEntrySchema>;
export type FeedbackSummary = z.infer<typeof feedbackSummarySchema>;
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
export type NextTopicSuggestion = z.infer<typeof nextTopicSuggestionSchema>;
export type ArtifactReference = z.infer<typeof artifactReferenceSchema>;
export type WorkflowStepResult = z.infer<typeof workflowStepResultSchema>;
export type ModuleExecutionContext = z.infer<typeof moduleExecutionContextSchema>;
export type WorkflowRun = z.infer<typeof workflowRunSchema>;
export type ProviderKind = z.infer<typeof providerKindSchema>;
export type MemorySaveResult = z.infer<typeof memorySaveResultSchema>;
