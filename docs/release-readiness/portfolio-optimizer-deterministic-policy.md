# WRE-119 Portfolio Optimizer Deterministic Bounds & Fallback Policy

This artifact hardens portfolio-optimizer with explicit bounds validation and deterministic fallback semantics.

## Added contracts

1. `packs/core-skills-pack/portfolio-optimizer/contracts/parameter-bounds.schema.json`
   - Defines required bounds for capital and optimizer constraints.
   - Encodes expected ranges for max/min weights, turnover, and strategy count.

2. `packs/core-skills-pack/portfolio-optimizer/contracts/fallback-policy.json`
   - Defines deterministic execution order.
   - Defines fallback actions for underconstrained, contradictory, and unsolved objective cases.
   - Defines default conflict resolution priority (`safety_first`).

## Deterministic conflict resolution behavior

When constraints conflict, portfolio-optimizer must resolve in this order:
1. risk limits
2. exposure limits
3. turnover limits
4. return objective

If contradictory constraints prevent a valid solution, return fail-closed with explicit conflict report; do not fabricate an allocation.

## Fallback actions

- Underconstrained input: equal-weight baseline with risk caps.
- Contradictory input: fail-closed with conflict report.
- Unsolved objective: risk-budget baseline allocation (bounded heuristic).

## Operator expectations

- Outputs remain machine-readable and auditable.
- Missing or invalid constraint inputs produce explicit remediation guidance.
- Safety constraints dominate return optimization by default.
