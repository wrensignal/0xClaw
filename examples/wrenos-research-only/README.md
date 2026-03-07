# Example: WrenOS Research Only

This example shows a no-trade setup for signal/research loops.

## Goal

- Run with profile `research-only`
- Keep execution disabled
- Validate inference connectivity and status surface

## Steps

```bash
# from repo root
npm install

# initialize config in your workspace
wrenos init --profile research-only

# validate environment + config
wrenos doctor
wrenos status

# optional: override inference URL
wrenos config set inference.baseUrl https://api.speakeasyrelay.com

# inference connectivity smoke test
wrenos test inference
```

## Expected result

- `.wrenos/config.json` created with `liveExecution: false`
- `.mcp.json` generated with default MCP servers
- doctor/status return healthy outputs
- no trade execution path enabled
