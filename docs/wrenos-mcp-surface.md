# WrenOS MCP Surface (v1)

## Exposed tools
- `wrenos.discovery.scan_token_universe`
- `wrenos.scoring.score_token`
- `wrenos.risk.assess_portfolio`
- `wrenos.backtesting.run_strategy_backtest`

## Auth and safety boundaries
- MCP surface is read/analysis-oriented in v1 and returns structured envelopes.
- No wallet signing or trade execution is exposed through this server.
- Deploy behind operator-controlled environment and network boundary.
- Treat tool outputs as advisory unless separately approved by operator policy.

## Local run
```bash
node packages/mcp/src/index.mjs
```

## Example client call (JSON-RPC over stdio)
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"wrenos.scoring.score_token","arguments":{"token":"SOL"}}}
```

## Smoke test
```bash
node --test packages/mcp/test/*.test.mjs
```
