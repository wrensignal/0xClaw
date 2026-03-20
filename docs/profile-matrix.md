# WrenOS Profile Matrix (Runtime-Validated)

This matrix reflects **current template reality** from `packages/profiles/templates` and runtime validation via `wrenos init --profile <name>` + `wrenos doctor`.

Validated profiles (7):
- `research-agent`
- `research-only`
- `solo-trader-paper`
- `trading-agent-paper`
- `trading-agent-live-disabled`
- `meme-discovery-research`
- `meme-discovery-trading-paper`

## Profile intent vs capabilities vs constraints

| Profile | Intent | Key capabilities (from template) | Key constraints / guardrails |
|---|---|---|---|
| `research-agent` | Continuous market/token research lane | Inference provider configured (`speakeasy`), loop enabled | `liveExecution: false`; no explicit risk notional block because execution is not the primary mode |
| `research-only` | Minimal intelligence-only workflow | Inference provider configured (`speakeasy`), loop enabled | `liveExecution: false`; execution not intended |
| `solo-trader-paper` | Single-agent paper execution workflow | Inference provider configured; risk block present (`maxTradeUsd: 25`, `maxDailyNotionalUsd: 75`) | `liveExecution: false` |
| `trading-agent-paper` | Trading-focused paper execution profile | Inference provider configured; risk block present (`maxTradeUsd: 25`, `maxDailyNotionalUsd: 75`) | `liveExecution: false` |
| `trading-agent-live-disabled` | Live-capable shape held in safe mode | Inference provider configured; risk block present (`maxTradeUsd: 25`, `maxDailyNotionalUsd: 75`) | `liveExecution: false` (explicitly disabled) |
| `meme-discovery-research` | Meme-token discovery/scoring lane | Inference provider configured (`speakeasy`), loop enabled | `liveExecution: false`; research-oriented profile |
| `meme-discovery-trading-paper` | Paper trading lane for meme-discovery flow | Inference provider configured; risk block present (`maxTradeUsd: 25`, `maxDailyNotionalUsd: 75`) | `liveExecution: false` |

## Runtime validation evidence

Validation method used:
1. `wrenos init --profile <profile>`
2. `wrenos doctor` (with `HELIUS_API_KEY` set in test env)

Expected result:
- doctor payload `ok: true` for each profile in isolated smoke workspaces.

## Reality audit notes

- All 7 templates are currently runnable under init + doctor flow.
- All templates remain paper-safe by default (`liveExecution: false`).
- Previous docs language implying a template field like `tradeExecution` was stale; current template reality is driven by `liveExecution`, risk blocks, and profile intent.

## References

- Templates: `packages/profiles/templates/*.json`
- Validation tests: `packages/cli/test/smoke.test.mjs`
