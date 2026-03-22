# Railway First-Run Playbook (v1)

This playbook defines the verified one-click deployment path and failure remediations.

## Minimal env contract (required)
- `PROFILE` (recommended: `research-agent`)
- `OPENCLAW_API_KEY`
- `TELEGRAM_BOT_TOKEN`

Conditional:
- `AGENT_WALLET_PRIVATE_KEY` only when execution-enabled mode is explicitly enabled.

## Verified happy path
1. Set required env vars in Railway.
2. Deploy service.
3. Run preflight and first-run checks:

```bash
npm run railway:preflight
npm run railway:first-run
npm run railway:health
```

Expected result:
- preflight passes required env checks
- init/doctor/status/start --once all succeed
- post-deploy health reports all checks `ok: true`

## Common failures and remediation

### Failure 1: missing required env
Symptom: `railway-env-preflight` reports missing `OPENCLAW_API_KEY` or `TELEGRAM_BOT_TOKEN`.
Remediation: add missing values as Railway secret env vars and redeploy.

### Failure 2: config/bootstrap not initialized
Symptom: `doctor` or `status` fails due to missing `.wrenos/config.json`.
Remediation: run `node packages/cli/src/index.mjs init --profile research-agent`, then rerun health checks.

### Failure 3: one-shot loop failure (`start --once`)
Symptom: `railway-postdeploy-health` fails on `start-once`.
Remediation: inspect `doctor` output in same run, fix listed checks, rerun `npm run railway:health`.

## Notes
- Keep `liveExecution` off by default unless explicitly enabled and approval-gated.
- Preflight scripts are designed to fail fast with operator-actionable output.
- Hosted env contract source-of-truth: `docs/env-contract-hosted.md` (`schemas/contracts/env.hosted.schema.json`).
- Operator lane env extensions are documented separately in `docs/env-contract-operator.md`.
