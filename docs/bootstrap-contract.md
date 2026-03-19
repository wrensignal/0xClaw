# v1 Bootstrap Contract

This document defines the canonical first-run contract for WrenOS operators.

## Scope
Contract path:
1. clone
2. install
3. init
4. doctor
5. status
6. start --once

## Required environment contract
- Node.js >= 20 (CI uses 22)
- npm available
- Writable workspace directory
- No required API keys for baseline paper bootstrap

Optional for richer checks:
- `HELIUS_API_KEY`
- adapter/provider credentials depending on profile and integrations

## Canonical sequence
```bash
git clone https://github.com/wrensignal/wrenOS.git
cd wrenOS
npm ci
node packages/cli/src/index.mjs init --profile research-agent
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs status
node packages/cli/src/index.mjs start --once --interval 1
```

## Expected outcomes
- `init`: writes `.wrenos/config.json` and `.mcp.json`
- `doctor`: returns passing checks for baseline local setup
- `status`: prints structured runtime snapshot
- `start --once`: executes one heartbeat loop and exits cleanly

## Failure handling contract (actionable)
- Missing config:
  - Symptom: status/doctor references missing `.wrenos/config.json`
  - Action: rerun `init --profile research-agent`
- Missing MCP wiring:
  - Symptom: doctor notes missing `.mcp.json`
  - Action: rerun `init`
- Adapter test failures:
  - Symptom: diagnostics mention failing inference/execution checks
  - Action: run `doctor`, inspect details, then re-run `test inference` / `test execution`
- Runtime loop failure on `start --once`:
  - Symptom: non-zero exit from one-shot loop
  - Action: run `status`, then `doctor`, fix listed issues, retry once-run

## CI gate
The bootstrap contract is enforced by:
- `npm run smoke:bootstrap`
- GitHub Actions `ci` workflow step "Bootstrap smoke"
