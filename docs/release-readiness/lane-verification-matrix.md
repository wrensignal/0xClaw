# Lane-tagged verification matrix

This matrix defines anti-drift checks for the two-lane model.

## Tags
- `shared/*`: must pass in both lanes
- `hosted/*`: hosted-lane specific checks
- `operator/*`: operator-lane specific checks

## Current checks
- `shared/docs-drift` → `npm run docs:drift`
- `shared/contract-managed` → `npm run contract:managed`
- `hosted/env-doc-guardrail` → `npm run contract:env:hosted-docs`
- `hosted/docs-entrypoint` → `docs/hosted-quickstart.md` exists
- `operator/docs-entrypoint` → `docs/operator/README.md` exists
- `operator/env-contract` → `docs/env-contract-operator.md` exists

## CI wiring
- `verify-hosted` job runs `npm run verify:hosted`
- `verify-operator` job runs `npm run verify:operator`
- both jobs emit `docs/reports/lane-coverage-report.json` and upload as artifacts

## Policy
Any lane-sensitive PR must update this matrix and include at least one lane-tagged assertion.
