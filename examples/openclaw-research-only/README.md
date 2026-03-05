# Example: OpenClaw Research Only

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
node packages/cli/src/index.mjs init --profile research-only

# validate environment + config
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs status

# optional: override inference URL
node packages/cli/src/index.mjs config set inference.baseUrl https://api.speakeasyrelay.com

# inference connectivity smoke test
node packages/cli/src/index.mjs test inference
```

## Expected result

- `.0xclaw/config.json` created with `liveExecution: false`
- `.mcp.json` generated with default MCP servers
- doctor/status return healthy outputs
- no trade execution path enabled
