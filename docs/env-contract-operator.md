# Operator lane environment contract (OpenClaw/custom)

This is the env contract for operator-managed/custom runtime setups.

Schema:
- `schemas/contracts/env.base.schema.json`
- `schemas/contracts/env.operator.schema.json`

Required base:
- `PROFILE`
- `OPENCLAW_API_KEY`
- `TELEGRAM_BOT_TOKEN`

Operator-only extension knobs:
- `OPENCLAW_OPERATOR_MODE`
- `OPENCLAW_RUNTIME_TOPOLOGY`
- `OPENCLAW_ADAPTER_OVERRIDES`
- `OPENCLAW_MCP_SERVER_MAP`

Use this contract only for advanced/custom deployments, not hosted quickstart.
