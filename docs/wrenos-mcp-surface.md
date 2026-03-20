# WrenOS MCP Surface (v1)

## Native MCP surface

WrenOS exposes a native MCP server scaffold for external agents:

- Package: `packages/mcp`
- Binary: `wrenos-mcp`
- Transport: stdio (JSON-RPC)

### Tool surface

1. `wrenos.discovery.scan_token_universe`
2. `wrenos.scoring.score_token`
3. `wrenos.risk.assess_portfolio`
4. `wrenos.backtesting.run_strategy_backtest`

Status: scaffold contract is implemented (stable tool names + deterministic envelopes), with deeper runtime wiring tracked separately.

## Vendor MCP dependency surface (v1)

For v1, the supported vendor MCP/data providers are:

- `vendor/agenti-lite` (**keep**)
- `vendor/pump-fun-sdk-lite` (**keep**)
- `vendor/crypto-news-lite` (**keep**)

Deferred/non-critical for v1 runtime:

- `vendor/skills` (**defer**) — retained as optional portability snapshot, not required for core runtime/deploy path.

See authoritative classification:
- `docs/vendor-trim-manifest.md`

## Minimal local run

```bash
node packages/mcp/src/index.mjs
```

Then speak MCP JSON-RPC over stdin/stdout (`initialize`, `tools/list`, `tools/call`).

## Why this matters

Spec M requires WrenOS-native capabilities to be consumable by external agents. This surface defines stable native tool contracts while clearly separating required v1 vendor dependencies from deferred bundles.
