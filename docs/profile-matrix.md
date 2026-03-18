# WrenOS Profile Matrix

Consolidated matrix for shipped profile templates.

| Profile | Goal | Data Sources | Risk Posture | Execution Posture | Intended User | Paper/Live Status |
|---|---|---|---|---|---|---|
| `research-agent` | Continuous market/token research and signal generation | walletFlow, Birdeye, Lunar, Dexscreener, agenti-lite fallback | Low (research-only) | No trade execution (`tradeExecution: false`) | Operators running a dedicated research lane | Paper-only (live disabled) |
| `research-only` | Minimal research-focused workflow without execution concerns | walletFlow, Birdeye, Lunar, Dexscreener, agenti-lite fallback | Low (research-only) | No trade execution (`tradeExecution: false`) | Users who only want intelligence outputs | Paper-only (live disabled) |
| `solo-trader-paper` | Single-agent paper trading loop with bounded risk | Inference routes + execution venue connectivity | Medium-low (small notional caps) | Paper trade mode (`tradeExecution: paper`) | Solo operator testing strategy logic | Paper-only (live disabled) |
| `trading-agent-paper` | Trading-focused paper execution profile | Inference routes + Jupiter/Pumpfun venues | Medium-low (maxTrade/maxDaily caps) | Paper trade mode with execution adapter enabled | Operators validating trading stack before live | Paper-only (live disabled) |
| `trading-agent-live-disabled` | Live-capable shape with explicit live safety gate still disabled | Inference routes + Jupiter/Pumpfun venues | Medium-low + explicit live approval checklist | Paper trade mode plus live enablement guards | Operators preparing for eventual live transition | Paper-by-default; live blocked until explicit operator approval |
| `meme-discovery-research` | Discovery/scoring lane for meme-token opportunities | Nansen, Dexscreener, CoinGecko, Pumpfun, Crypto News, Lunar, Birdeye, agenti | Low-to-medium (research/scoring only) | No trade execution (`tradeExecution: false`) | Teams running separate discovery + execution agents | Paper-only (live disabled) |
| `meme-discovery-trading-paper` | Execute paper trades from meme-discovery pipeline with zoo management | Inference routes + Jupiter/Pumpfun venues + upstream discovery handoff | Medium (bounded notional, strategy zoo controls) | Paper trade mode (`tradeExecution: paper`) | Operators testing full discovery→trading handoff | Paper-only (live disabled) |

## Notes

- All shipped templates set `liveExecution: false` by default.
- `trading-agent-live-disabled` is intentionally **not** live: it adds explicit enablement requirements before any live mode transition.
- Inference defaults currently point to the configured hosted base URL and can be overridden by operator config.
