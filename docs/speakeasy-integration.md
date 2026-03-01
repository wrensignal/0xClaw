# Speakeasy Integration (Neutral)

This project supports private inference routing via Speakeasy-compatible endpoints.

## Baseline env

Set these in local env (never commit secrets):

- `SPEAKEASY_BASE_URL`
- `SPEAKEASY_API_KEY` (if required by your deployment)
- model routing envs as needed

## Recommended usage model

- Research calls: cheaper research model route
- Strategy synthesis: deeper reasoning route
- Codegen/refinement: coding route

## Operational guardrails

- Cache deterministic calls where possible
- Gate expensive calls on material input deltas
- Log model usage/cost for each cycle
- Do not treat response success as economic settlement proof in payment paths

## Fallback behavior

When private inference route degrades:
1. reduce iteration frequency
2. keep paper mode
3. continue signal collection + no-new-signal briefs
4. avoid silent failure; report degraded status explicitly
