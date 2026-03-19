# Core Skills Pack Index (Operational Readiness)

This index maps capabilities, dependencies, and readiness for the 13 core skills.

## Capability map

| Skill | Primary capability | Category |
|---|---|---|
| solana-token-discovery | Multi-path token candidate discovery | Research |
| pump-fun-monitor | Graduation/event surveillance | Research |
| whale-tracker | Large-wallet flow monitoring | Research |
| crypto-news-scanner | Narrative/sentiment monitoring | Research |
| token-deep-dive | Single-token comprehensive analysis | Research |
| solana-token-scan | Single-entry orchestrated token scan | Research-Orchestration |
| signal-pipeline | Research-to-trading handoff routing | Orchestration |
| strategy-builder | Strategy definition, backtest, zoo ranking | Strategy |
| risk-manager | Portfolio/strategy risk enforcement policy | Risk |
| trailing-stop | Exit logic and stop management policy | Execution-Guardrails |
| portfolio-optimizer | Regime-aware allocation/parameter optimization | Portfolio |
| performance-report | Daily/weekly performance reporting | Reporting |
| heartbeat-monitor | System/feed/strategy health watchdog | Operations |

## Dependency map (high-level)

- `solana-token-discovery` → agenti-lite, pump-fun-sdk-lite, crypto-news-lite, optional helius/lunarcrush/birdeye
- `pump-fun-monitor` → pump-fun-sdk-lite, optional helius
- `whale-tracker` → agenti-lite wallet analytics, crypto-news-lite whale tools, optional helius
- `crypto-news-scanner` → crypto-news-lite, optional agenti-lite social + lunarcrush
- `token-deep-dive` → aggregate of configured sources (agenti-lite, crypto-news-lite, helius, pump-fun, optional birdeye/lunarcrush)
- `solana-token-scan` → token-deep-dive + whale-tracker + pump-fun-monitor + crypto-news-scanner
- `signal-pipeline` → outputs from all research skills + inbox filesystem
- `strategy-builder` → research outputs + historical market/flow datasets
- `risk-manager` → strategy-builder outputs + position/portfolio state
- `trailing-stop` → open position state + risk-manager policy envelope
- `portfolio-optimizer` → strategy performance artifacts + risk constraints
- `performance-report` → trade logs + zoo/risk states
- `heartbeat-monitor` → all skill health outputs + scheduler state

## Readiness tags

Tag meanings:
- `ready`: operationally usable with current contracts/sections
- `needs-work`: usable but needs deeper rewrite for stronger deterministic contracts or tighter policy semantics
- `deprecated`: retained only for migration compatibility

| Skill | Tag | Rationale |
|---|---|---|
| solana-token-discovery | ready | Comprehensive procedure + dependency/source mapping now standardized with output/failure sections |
| pump-fun-monitor | ready | Event-driven monitor, clear data model, standardized sections present |
| whale-tracker | ready | Clear monitoring modes + source model; standardized output/failure contract added |
| crypto-news-scanner | ready | Narrative monitoring flow and source coverage are concrete; standardized sections added |
| token-deep-dive | ready | Single-token report flow and dimensional scoring are defined; standardized sections added |
| solana-token-scan | ready | Orchestration contract explicit; failure-handling and output contract now standardized |
| signal-pipeline | ready | Routing/validation/retention defined; standardized sections now present |
| strategy-builder | needs-work | Very broad scope; should be split into tighter subcontracts for rule translation vs backtest vs zoo governance |
| risk-manager | ready | Strong policy/control semantics with guardrail-first framing |
| trailing-stop | ready | Exit mechanism taxonomy is clear; now includes standardized contract sections |
| portfolio-optimizer | needs-work | Optimization policy is useful but needs stricter machine-readable parameter bounds and deterministic fallback branches |
| performance-report | ready | Reporting behavior and source dependencies are clear; standardized sections added |
| heartbeat-monitor | ready | Operational watchdog logic and escalation model are defined; standardized sections added |

## Deep-rewrite follow-ups

Follow-up issues should be tracked for:
1. `strategy-builder` contract decomposition
2. `portfolio-optimizer` deterministic optimization/fallback contract hardening
