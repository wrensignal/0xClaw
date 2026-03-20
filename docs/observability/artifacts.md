# Observability Artifacts (Operator Evidence)

This doc defines standard evidence artifacts for support and audits.

## Artifact schemas

- `schemas/observability/decision-log.schema.json`
- `schemas/observability/health-summary.schema.json`
- `schemas/observability/run-trace.schema.json`

## Sample artifact generation

```bash
node scripts/generate-observability-samples.mjs
```

Generated samples:
- `examples/artifacts/decision-log.sample.json`
- `examples/artifacts/health-summary.sample.json`
- `examples/artifacts/run-trace.sample.json`

## Integrity validation

```bash
node scripts/validate-observability-artifacts.mjs
```

Validator checks required schema fields and returns machine-readable pass/fail output.

## Interpretation quick guide

- `decision-log`: what decision was made and why
- `health-summary`: component readiness + degraded/fail indicators
- `run-trace`: execution step timeline for audit reconstruction
