# WrenOS MCP Surface (Native Capabilities)

WrenOS now exposes a native MCP server scaffold for external agents:

- Package: `packages/mcp`
- Binary: `wrenos-mcp`
- Transport: stdio (JSON-RPC)

## Tool Surface

1. `wrenos.discovery.scan_token_universe`
   - Discovery envelope for ranked candidate scans
2. `wrenos.scoring.score_token`
   - Composite lane scoring envelope for a single token
3. `wrenos.risk.assess_portfolio`
   - Portfolio risk posture and constraints guidance
4. `wrenos.backtesting.run_strategy_backtest`
   - Backtest request/summary envelope

## Status

This is an MCP **surface scaffold**: schema + protocol + stable tool names are implemented now, with deterministic envelopes.

Next wiring step (follow-up): connect tool handlers to live WrenOS pipelines/artifacts (discovery feeds, scorer outputs, risk state, backtest engine state).

## Minimal local run

```bash
node packages/mcp/src/index.mjs
```

Then speak MCP JSON-RPC over stdin/stdout (`initialize`, `tools/list`, `tools/call`).

## Why this matters

Spec M requires WrenOS-native capabilities to be consumable by external agents. This package establishes the native MCP contract with explicit tool naming and argument schemas so integration can begin immediately and evolve safely.
