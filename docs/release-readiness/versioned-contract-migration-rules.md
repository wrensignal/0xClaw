# WRE-126 Versioned Strategy/Explainability Contracts + Migration Rules

## Objective
Prevent silent drift by versioning contracts and defining explicit v1 -> v2 migration rules.

## Versioned contract paths

- Strategy check
  - v1: `schemas/contracts/v1/strategy-check.schema.json`
  - v2: `schemas/contracts/v2/strategy-check.schema.json`
- Explainability
  - v1: `schemas/contracts/v1/explainability.schema.json`
  - v2: `schemas/contracts/v2/explainability.schema.json`

## Migration rules (v1 -> v2)

### Strategy check
- `strategy_id` (v1) -> `strategy.id` (v2)
- add `compat` block:
  - `migrated_from: "1.0.0"`
  - `migration_rule: "strategy_id -> strategy.id"`

### Explainability
- preserve `decision`, `confidence`, `reasons`
- add `evidence: []` with safe default
- add `compat` block:
  - `migrated_from: "1.0.0"`
  - `migration_rule: "added evidence[] with safe empty default"`

## Validation command

```bash
node scripts/migrate-contract-v1-to-v2.mjs strategy-check examples/contracts/strategy-check.v1.sample.json
node scripts/migrate-contract-v1-to-v2.mjs explainability examples/contracts/explainability.v1.sample.json
```

Both commands must return `ok: true`.
