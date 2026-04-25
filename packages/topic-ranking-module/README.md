# Topic Ranking Module

Scores and ranks generated topics before voting.

Input: `TopicGenerationResult` plus `GapAnalysisResult`

Output: `RankedTopicList`

Providers:
- `MockTopicRankingProvider`: deterministic scoring based on high-priority gap matches.
- `RealTopicRankingProvider`: placeholder for rule engine, semantic reranker, or AI scoring.

Integration rule: keep score breakdown explainable; total score must stay between 0 and 1.
