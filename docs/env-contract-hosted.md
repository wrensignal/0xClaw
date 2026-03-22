# Hosted lane environment contract (Railway)

This is the env contract for the hosted Railway path.

Schema:
- `schemas/contracts/env.base.schema.json`
- `schemas/contracts/env.hosted.schema.json`

Required:
- `PROFILE`
- `OPENCLAW_API_KEY`
- `TELEGRAM_BOT_TOKEN`

Conditional:
- `AGENT_WALLET_PRIVATE_KEY` only when execution-enabled mode is explicitly enabled.

Guardrail:
- Hosted docs/examples must not include operator-only variables:
  - `OPENCLAW_OPERATOR_MODE`
  - `OPENCLAW_RUNTIME_TOPOLOGY`
  - `OPENCLAW_ADAPTER_OVERRIDES`
  - `OPENCLAW_MCP_SERVER_MAP`

Validation command:
```bash
node scripts/validate-hosted-env-docs.mjs
```
