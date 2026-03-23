# Railway First-Run Playbook (v1)

This playbook defines the verified one-click deployment path and failure remediations.

## Canonical hosted env variable matrix

| Variable | Required | Secret | Default / example | Description |
|---|---:|---:|---|---|
| `PROFILE` | Yes | No | `research-agent` | Hosted runtime profile template. |
| `OPENCLAW_API_KEY` | Yes | Yes | _(none)_ | Gateway/API auth key for OpenClaw runtime integration. |
| `TELEGRAM_BOT_TOKEN` | Yes | Yes | _(none)_ | Telegram operator bot token used by notification + operator flows. |
| `OPENAI_API_KEY` | Yes* | Yes | _(none)_ | Inference provider key (OpenAI path). |
| `ANTHROPIC_API_KEY` | Yes* | Yes | _(none)_ | Inference provider key (Anthropic path). |
| `GEMINI_API_KEY` | Yes* | Yes | _(none)_ | Inference provider key (Gemini path). |
| `AI_API_KEY` | Optional | Yes | _(none)_ | Backward-compatible umbrella inference key alias. |
| `WRENOS_ENABLE_EXECUTION` | Optional | No | `false` | Enables execution-required checks when set to `true`. |
| `AGENT_WALLET_PRIVATE_KEY` | Conditional | Yes | _(none)_ | Required only when `WRENOS_ENABLE_EXECUTION=true`. |

\* At least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` (or compatible `AI_API_KEY`) must be set for hosted preflight to pass.

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
- Advanced operator/custom runtime docs: `docs/operator/README.md`.
- Rendered template field mapping evidence: `docs/release-readiness/evidence/2026-03-23-wre149-railway-vars-matrix.md`.
