# WRE-118 Strategy-Builder Contract Decomposition

This artifact decomposes strategy-builder into three explicit subcontracts.

## 1) NL Rule Translation Contract
- Purpose: turn natural-language strategy intent into deterministic rule schema.
- Schema: `packs/core-skills-pack/strategy-builder/contracts/nl-rule-translation.schema.json`
- Failure semantics:
  - malformed/ambiguous intent => `validation.ok=false` with warnings
  - missing mandatory rule dimensions => fail-closed (no backtest run)

## 2) Backtest Contract
- Purpose: deterministic backtest output + gate evaluations.
- Schema: `packs/core-skills-pack/strategy-builder/contracts/backtest-contract.schema.json`
- Failure semantics:
  - insufficient data => `status=insufficient_data`
  - gate failure => `status=fail`
  - data-source degradation => `failure_semantics.mode=partial_degraded` only if minimum gate evidence remains; else fail-closed

## 3) Zoo Governance Contract
- Purpose: champion/challenger decisions with explicit promotion semantics.
- Schema: `packs/core-skills-pack/strategy-builder/contracts/zoo-governance-contract.schema.json`
- Failure semantics:
  - inconsistent leaderboard / missing champion => `action=pause_all` or `defer_decision` until state is coherent

## Deterministic policy outcomes
- No implicit promotion without explicit `promotion_decision.action`
- No live execution implication from strategy rank alone
- Any contract violation returns structured failure envelope, never silent pass

## Implementation note
This pass introduces machine-readable contract schemas and operating semantics; deeper runtime wiring to enforce these schemas at execution boundaries is tracked as follow-up implementation in the strategy-builder runtime roadmap.
