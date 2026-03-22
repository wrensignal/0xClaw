# Hosted Quickstart (default path)

This is the default WrenOS onboarding lane for hosted deployments (Railway-first).

## Hosted lane flow
1. Install dependencies
2. Initialize profile (`research-agent` recommended)
3. Run diagnostics (`wrenos doctor`)
4. Validate runtime snapshot (`wrenos status`)
5. Run one-click deploy path and first-run checks

## Required references
- Env contract: `docs/env-contract-hosted.md`
- First-run playbook: `docs/railway-first-run-playbook.md`
- Safety posture: `docs/safety.md`

## Commands
```bash
npm install
wrenos init --profile research-agent
wrenos doctor
wrenos status
```

Railway path:
```bash
npm run railway:preflight
npm run railway:first-run
npm run railway:health
```

## Need advanced/custom runtime?
Use the operator lane docs:
- `docs/operator/README.md`
