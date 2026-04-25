# Gap Analysis Module

Analyzes team profile data and produces prioritized knowledge gaps.

Input: `TeamProfile`

Output: `GapAnalysisResult`

Providers:
- `MockGapAnalysisProvider`: derives static gaps from sample pain points.
- `RealGapAnalysisProvider`: placeholder for rule-based scoring, embeddings, or AI analysis.

Integration rule: gaps must include clear evidence and stable ids so topic generation can link back to them.
