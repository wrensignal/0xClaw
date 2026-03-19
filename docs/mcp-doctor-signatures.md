# MCP Doctor Diagnostics Signatures

This page documents expected `wrenos doctor` MCP diagnostics and how to remediate failures.

## Default servers covered
- `agenti-lite`
- `pump-fun-sdk-lite`
- `helius`

Each server emits three checks in doctor output:
- `mcp.server.<name>.command`
- `mcp.server.<name>.env`
- `mcp.server.<name>.startup`

## Expected pass signature
Typical pass example:

- `mcp.server.agenti-lite.command.ok = true`
- `mcp.server.agenti-lite.env.ok = true`
- `mcp.server.agenti-lite.startup.ok = true`

When running in isolated smoke workspaces without vendored tree, startup probe is safely skipped with detail:
- `vendor tree not present in current workspace; startup probe skipped`

## Expected fail signature (env requirements)
Common failure for helius when env is unresolved:

- `mcp.server.helius.env.ok = false`
- detail includes missing variable(s), e.g. `HELIUS_API_KEY`
- remediation includes exact env names to set

## Remediation flow
1. Run:
   ```bash
   wrenos doctor
   ```
2. Locate failing `mcp.server.*` checks.
3. Apply remediation from `detail`.
4. Re-run `wrenos doctor` until `ok: true`.

## Notes
- MCP diagnostics are structured and machine-readable in doctor JSON output.
- Use this output in CI or bootstrap scripts to fail fast on misconfiguration.
