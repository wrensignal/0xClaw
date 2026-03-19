---
name: portfolio-optimizer
description: "Portfolio and strategy allocation optimizer for WrenOS. Tunes strategy parameters across lookback windows, optimizes allocation weights under risk constraints, adapts recommendations to market regime, and outputs a risk-return frontier with recommended weights + tuned parameters."
---

# Portfolio Optimizer

Optimize strategy mix and parameter settings for current conditions while preserving explicit risk controls.

## What It Does

Given strategy performance inputs and constraints, this skill produces:

1. **Parameter tuning across strategies and windows**
   - tests candidate parameter sets per strategy
   - evaluates across multiple lookbacks (e.g., 7d / 30d / 90d)
   - proposes tuned parameter set per strategy

2. **Allocation weight optimization**
   - computes recommended capital weights across eligible strategies
   - enforces constraints (max weight, min weight, concentration limits)

3. **Regime-aware rebalancing guidance**
   - classifies regime (risk-on, risk-off, choppy/neutral)
   - adjusts allocations and cadence recommendations by regime

4. **Risk-return frontier output**
   - outputs frontier points with expected return/risk tradeoffs
   - marks suggested operating point under current risk posture

5. **Recommended weights + tuned params**
   - final `recommended_weights` map
   - final `tuned_parameters` map

## Inputs

Required:
- strategy universe with historical performance metrics
- risk limits and portfolio constraints

Optional:
- regime signal inputs
- turnover limits
- rebalance frequency target

## Output Shape

```json
{
  "window_set": ["7d", "30d", "90d"],
  "regime": "risk_on|risk_off|neutral",
  "recommended_weights": {
    "strategy_a": 0.35,
    "strategy_b": 0.25,
    "strategy_c": 0.40
  },
  "tuned_parameters": {
    "strategy_a": {"entryThreshold": 0.62, "stopPct": 0.08},
    "strategy_b": {"maxPositionUsd": 1200},
    "strategy_c": {"rebalanceCadence": "4h"}
  },
  "frontier": [
    {"risk": 0.10, "expectedReturn": 0.14, "label": "conservative"},
    {"risk": 0.16, "expectedReturn": 0.22, "label": "balanced"},
    {"risk": 0.24, "expectedReturn": 0.31, "label": "aggressive"}
  ],
  "selected_frontier_point": "balanced",
  "rebalancing_guidance": {
    "action": "rebalance|hold|de-risk",
    "reason": "regime and drift summary",
    "nextReview": "ISO8601"
  },
  "confidence": "high|medium|low",
  "generated_at": "ISO8601"
}
```

## Method (Policy-Level)

- Compute normalized performance/risk scores per strategy per window.
- Penalize unstable or highly correlated strategies.
- Generate candidate allocations under constraints.
- Evaluate candidate portfolios for frontier construction.
- Apply regime adjustment policy to final recommendation.

## Safety Rules

- No direct trade execution.
- Respect hard portfolio risk limits.
- If data quality is weak or regime signals conflict, prefer conservative allocation and lower turnover.
- Never bypass operator approval policy for downstream execution.

## Examples

```
"Optimize my strategy weights for the next week"
"Tune parameters for current regime and give me a balanced frontier point"
"Rebalance guidance for 30d + 90d windows with max 40% per strategy"
```

## Dependencies

- strategy performance outputs (e.g., strategy-builder/risk-manager artifacts)
- optional regime/context feeds from existing WrenOS skills

## Notes

This is an optimization/recommendation skill only. It generates weight and parameter guidance for operator review, not autonomous execution.

## Deterministic Bounds & Fallback Policy

This skill now uses explicit contract artifacts:

- `packs/core-skills-pack/portfolio-optimizer/contracts/parameter-bounds.schema.json`
- `packs/core-skills-pack/portfolio-optimizer/contracts/fallback-policy.json`

Conflict resolution priority is deterministic and safety-first by default:
1. risk limits
2. exposure limits
3. turnover limits
4. return objective

If constraints are contradictory, the optimizer should fail-closed with an explicit conflict report rather than emit unsafe allocations.
