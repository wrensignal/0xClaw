---
name: risk-manager
description: "Configurable risk controls for WrenOS. Enforces per-trade stop losses, per-strategy drawdown throttles, portfolio-level drawdown pauses, position sizing rules, exposure limits, and kill-switch behavior. Ships with conservative defaults. The guardrail layer between strategy-builder and live execution. Paper-first by default."
---

# Risk Manager

The guardrail layer for your trading agent. Enforces position sizing, stop losses, drawdown limits, exposure caps, and kill-switch behavior — so your strategies stay within the boundaries you set, even when the market doesn't cooperate.

## How It Works

You define your risk policy. The agent enforces it on every trade, every strategy, and across your entire portfolio. Risk controls are checked before execution (pre-trade) and monitored continuously during open positions (post-trade). If any limit is breached, the agent pauses, closes, or escalates depending on the severity.

This skill does not decide what to trade. Strategy-builder does that. Risk-manager decides how much to trade, when to stop, and when to shut everything down.

**Examples:**
```
"Never risk more than 2% per trade"
"Pause any strategy that hits 10% drawdown"
"Stop all trading if portfolio drops 15% from peak"
"Max 3 positions open at once, max 25% in any one token"
"Set a hard stop at -12% on every trade"
"Kill switch — stop everything now"
"Show me my current risk exposure"
```

## Core Risk Controls

### Per-Trade Controls
Applied to every individual trade before execution.

| Control | Default | Range | Description |
|---|---|---|---|
| `maxPositionSizePct` | 2% | 0.5% - 10% | Maximum allocation per trade as % of portfolio |
| `hardStopLossPct` | 12% | 3% - 30% | Maximum loss per trade before forced close |
| `maxSlippageBps` | 100 | 25 - 500 | Maximum acceptable slippage at execution (basis points) |
| `maxSlippageBpsHighLiquidity` | 50 | 10 - 200 | Tighter slippage cap for high-liquidity pairs |
| `tokenApprovalMode` | "exact" | exact / unlimited | Token approval strategy (exact-amount recommended) |
| `newProtocolApproval` | "require_user" | require_user / auto | First interaction with unknown protocol requires user approval |

### Per-Strategy Controls
Applied to each strategy in the zoo independently.

| Control | Default | Range | Description |
|---|---|---|---|
| `strategyMaxDrawdownPct` | 10% | 3% - 30% | Drawdown threshold to pause the strategy |
| `strategyDrawdownAction` | "pause" | pause / reduce / alert_only | What happens when strategy DD limit is hit |
| `maxDailyTradesPerStrategy` | 10 | 1 - 50 | Maximum trades per strategy per day |
| `maxConcurrentPositionsPerStrategy` | 2 | 1 - 5 | Maximum open positions per strategy at once |

### Portfolio-Level Controls
Applied across all strategies combined.

| Control | Default | Range | Description |
|---|---|---|---|
| `portfolioMaxDrawdownPct` | 15% | 5% - 40% | Portfolio-wide drawdown threshold |
| `portfolioDrawdownAction` | "pause_all" | pause_all / reduce_all / alert_only | What happens when portfolio DD limit is hit |
| `maxDailyDrawdownPct` | 4% | 1% - 10% | Intraday drawdown limit — stop opening new risk for the day |
| `maxTotalExposurePct` | 80% | 20% - 100% | Maximum % of portfolio deployed across all positions |
| `maxSingleAssetExposurePct` | 25% | 5% - 50% | Maximum % of portfolio in any one token (including adds) |
| `maxConcurrentPositions` | 3 | 1 - 10 | Maximum total open positions across all strategies |

### Alert Rules
Conditions that trigger operator notification (even if not a breach).

| Alert | Default Threshold | Description |
|---|---|---|
| Single-asset move | >5% in 1h | Watched asset moved sharply |
| Portfolio equity move | >3% intraday | Portfolio value changed significantly |
| Failed transaction burst | 3+ consecutive | Multiple execution failures in a row |
| Unexpected approval/transfer | any | Unrecognized on-chain activity |
| Stablecoin depeg | >1% | Stablecoin peg deviation |

## Execution Modes

The risk manager enforces different behavior depending on the agent's execution mode.

### Paper Mode (default)
- All risk controls are evaluated but no real trades occur
- Violations are logged and reported as if they were real
- Useful for validating that risk policy + strategy interact correctly before going live

### Live Mode
- Risk controls enforce real pre-trade gates
- Positions are monitored continuously
- Breaches trigger real closes, pauses, or escalations
- Requires explicit operator approval to enter

### Research Mode
- Risk controls are informational only
- No trade gates enforced
- Used when the agent is only running backtests and research, not executing

## How Controls Are Enforced

### Pre-Trade Gate (before every execution)

Before any trade executes, the risk manager checks:

1. **Position size** — does this trade exceed `maxPositionSizePct`?
2. **Portfolio exposure** — will total exposure exceed `maxTotalExposurePct`?
3. **Single-asset exposure** — will this token exceed `maxSingleAssetExposurePct`?
4. **Concurrent positions** — are we at the limit already?
5. **Strategy daily trades** — has this strategy used its daily trade allowance?
6. **Strategy drawdown** — is this strategy currently paused due to DD?
7. **Portfolio drawdown** — is the portfolio in a DD pause?
8. **Daily drawdown** — has the daily DD limit been hit?
9. **Slippage estimate** — does estimated slippage exceed the cap?
10. **Protocol approval** — is this a new protocol requiring user approval?

If any check fails, the trade is **blocked** and the reason is logged. The agent does not retry automatically — it reports the block to the operator.

### Post-Trade Monitoring (continuous while positions are open)

While positions are open, the risk manager monitors:

1. **Hard stop loss** — has the position hit the hard stop?
2. **Strategy drawdown** — has the strategy's aggregate DD crossed the threshold?
3. **Portfolio drawdown** — has the portfolio's aggregate DD crossed the threshold?
4. **Daily drawdown** — has the intraday equity change crossed the threshold?

If any post-trade limit is breached:
- **Hard stop**: position closed immediately
- **Strategy DD**: action depends on `strategyDrawdownAction` (pause / reduce / alert)
- **Portfolio DD**: action depends on `portfolioDrawdownAction` (pause_all / reduce_all / alert)
- **Daily DD**: no new positions opened for the rest of the day

### Kill Switch

Immediate emergency stop. Activated by operator command.

```
User: "Kill switch — stop everything"
Agent: "Kill switch activated.
        ✅ All new trade execution paused
        ✅ All open orders cancelled
        ⚠️ Open positions NOT auto-closed (manual review required)
        
        To resume: 'Resume trading' 
        To close all positions: 'Close all positions'"
```

Kill switch behavior:
- Stops all new trade creation/execution immediately
- Cancels any pending/open orders
- Does NOT automatically close existing positions (prevents panic-selling into bad fills)
- Requires explicit operator command to close positions or resume trading

## Risk Dashboard

The agent maintains a real-time risk summary accessible on demand.

```
User: "Show me my risk exposure"
Agent: "📊 RISK DASHBOARD
        
        Portfolio: $7,840 equity
        Deployed: $1,920 (24.5%)
        Available: $5,920 (75.5%)
        
        Open positions: 2 of 3 max
        - WOJAK: $1,120 (14.3% of portfolio) — PnL: +$85 (+8.2%)
        - BONK: $800 (10.2% of portfolio) — PnL: -$32 (-3.8%)
        
        Drawdown:
        - Portfolio: -1.2% from peak (limit: 15%)
        - Daily: -0.4% (limit: 4%)
        - Strategy 'my_momentum_v1': -2.1% (limit: 10%)
        
        Alerts: none
        Kill switch: inactive
        Mode: paper"
```

## Output Format

### Risk State File

Written to the agent workspace and updated on every trade and monitoring cycle.

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "risk-state",
  "mode": "paper",
  "portfolio": {
    "equityUsd": 7840,
    "deployedUsd": 1920,
    "deployedPct": 24.5,
    "availableUsd": 5920,
    "peakEquityUsd": 7935,
    "drawdownFromPeakPct": 1.2,
    "dailyDrawdownPct": 0.4
  },
  "positions": [
    {
      "token": "WOJAK",
      "address": "5tN42n...",
      "sizeUsd": 1120,
      "portfolioPct": 14.3,
      "unrealizedPnlUsd": 85,
      "unrealizedPnlPct": 8.2,
      "hardStopPrice": null,
      "strategy": "my_momentum_v1"
    }
  ],
  "limits": {
    "concurrentPositions": { "current": 2, "max": 3 },
    "totalExposure": { "current": 24.5, "max": 80 },
    "maxSingleAsset": { "current": 14.3, "max": 25 },
    "portfolioDrawdown": { "current": 1.2, "max": 15 },
    "dailyDrawdown": { "current": 0.4, "max": 4 }
  },
  "strategyDrawdowns": {
    "my_momentum_v1": { "current": 2.1, "max": 10, "status": "active" }
  },
  "killSwitch": false,
  "alerts": [],
  "feed_health": {
    "priceMonitoring": "ok",
    "positionTracking": "ok"
  }
}
```

**Output location:** `risk/risk-state.json` (overwritten each cycle)

### Pre-Trade Gate Log

Every blocked or approved trade is logged:

```json
{
  "ts": "2026-03-10T08:15:00.000Z",
  "type": "risk-gate",
  "action": "blocked",
  "reason": "maxConcurrentPositions exceeded (3 of 3)",
  "trade": {
    "strategy": "my_whale_trail_v0",
    "token": "PEPE2",
    "side": "buy",
    "requestedSizeUsd": 160,
    "requestedSizePct": 2.0
  }
}
```

**Output location:** `risk/gate-log-{date}.jsonl` (append-only, daily rotation)

### Heartbeat Compatibility

The `risk-state.json` and `feed_health` block are readable by the heartbeat supervisor agent. If portfolio drawdown exceeds the configured threshold, the supervisor will see it and can escalate to the operator.

## User Configuration

All parameters are configurable through Telegram conversation.

### Example Conversations

**Setting policy:**
```
User: "Never risk more than 2% per trade, max 3 positions, 
       hard stop at 12%"
Agent: "Risk policy updated:
        - Per-trade max: 2% of portfolio
        - Concurrent positions: 3 max
        - Hard stop: -12% per position
        Active immediately."
```

**Tightening drawdown limits:**
```
User: "Pause any strategy that hits 8% drawdown, and stop 
       all trading if portfolio drops 12%"
Agent: "Updated:
        - Per-strategy DD pause: 8% (was 10%)
        - Portfolio DD pause: 12% (was 15%)
        Both active immediately."
```

**Checking exposure:**
```
User: "How much am I exposed to right now?"
Agent: [returns risk dashboard]
```

**Kill switch:**
```
User: "Kill switch"
Agent: "Kill switch activated. All new trading stopped. 
        2 open positions preserved (not auto-closed).
        Say 'resume trading' to restart or 
        'close all positions' to exit everything."
```

**Resuming:**
```
User: "Resume trading"
Agent: "Trading resumed. Risk policy unchanged. 
        2 open positions still active.
        Pre-trade gates re-enabled."
```

**Drawdown breach:**
```
Agent: "⚠️ STRATEGY DRAWDOWN — my_momentum_v1
        
        Drawdown: -10.2% (limit: 10%)
        Action: strategy PAUSED
        Open positions for this strategy: 1 (held, not closed)
        
        No new trades will execute for my_momentum_v1 until 
        you manually resume it or drawdown recovers.
        
        Say 'resume my_momentum_v1' to override."
```

**Daily drawdown:**
```
Agent: "⚠️ DAILY DRAWDOWN LIMIT — -4.1% (limit: 4%)
        
        No new positions will be opened today.
        Existing positions monitored normally.
        Resets at midnight local time."
```

## Scheduling

Risk monitoring runs continuously as part of the agent's trading loop. No separate cron needed — risk checks execute on every trade attempt and on a configurable monitoring interval for open positions.

For position monitoring, the agent checks open positions on a regular interval:

```bash
openclaw cron create --name "risk-monitor" \
  --expression "*/5 * * * *" \
  --mandate "Run risk-manager position monitoring cycle. 
             Check all open positions against stop losses 
             and drawdown limits. Update risk-state.json. 
             Alert on breaches."
```

Each monitoring cycle:
1. Updates `risk-state.json` with current portfolio and position values
2. Checks all positions against hard stops
3. Checks strategy and portfolio drawdown limits
4. Sends Telegram alerts on breaches
5. Executes pause/close actions as configured

## Requirements

### MCP Servers

**Required:**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  }
}
```

agenti-lite provides real-time price data for position monitoring and slippage estimation. No API key required.

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Price monitoring + position tracking via agenti-lite | Yes (no key needed) |

**This skill works with zero API keys.**

### WrenOS Components (included)

- `vendor/agenti-lite/` — real-time price data for position monitoring (universal-crypto-mcp)

## Privacy

- No prompt or completion content is logged
- Risk state stored locally in agent workspace only
- Position data stored locally (excluded from git by default)
- No wallet private keys accessed by risk manager — it reads position state and price data only
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| Price feed unavailable | Alert operator, hold existing positions, block new trades |
| Position tracking desync | Alert operator with discrepancy details |
| Risk state file corrupted | Rebuild from position data, alert operator |
| 3+ consecutive execution failures | Automatic pause + alert (infrastructure issue) |
| Kill switch already active | Acknowledge, no double-action |

## Data Retention

- `risk-state.json`: overwritten each monitoring cycle (latest state only)
- Gate logs: 30 days, then rotated
- Alert history: 30 days
- All risk files excluded from git by default

## Relationship to Other Skills

### Upstream: strategy-builder
Strategy builder defines what to trade. Risk manager enforces how much and when to stop.

### Parallel: trailing-stop
Trailing stop handles dynamic exit mechanics (moving stop levels). Risk manager handles absolute limits (hard stops, drawdown pauses, exposure caps). They work together — trailing-stop adjusts exits within the envelope that risk-manager allows.

### Downstream: portfolio-optimizer
Portfolio optimizer suggests allocation weights. Risk manager enforces that those allocations stay within exposure and drawdown limits.

### Heartbeat: heartbeat-monitor
Heartbeat supervisor reads `risk-state.json` for portfolio health reporting.

## What This Skill Does NOT Do

- **Does not decide what to trade.** That's strategy-builder's job.
- **Does not set trailing stops.** That's trailing-stop's job. Risk manager enforces hard stops and drawdown limits.
- **Does not optimize portfolios.** That's portfolio-optimizer's job. Risk manager enforces the limits within which optimization operates.
- **Does not execute trades.** It gates and monitors them. Execution is handled by the agent's trading infrastructure.
- **Does not require any API keys.** Works with agenti-lite's free price data.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Upstream:** strategy-builder (strategies being risk-managed)
- **Parallel:** trailing-stop (dynamic exits within risk envelope)
- **Downstream:** portfolio-optimizer (allocation within risk limits)
- **Heartbeat-aware:** risk-state.json readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install risk-manager
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install `vendor/agenti-lite`
3. Configure `.mcp.json`
4. Tell your agent: "Set up risk controls — 2% per trade, 15% portfolio max drawdown"

## Dependencies

- WrenOS runtime (`wrenos init`, `wrenos doctor`)
- Required MCP/data sources listed in this skill's data-source sections
- Optional API keys where explicitly called out

## Output Contract

This skill should return a JSON-compatible payload containing:

- `summary`: short operator-facing summary
- `signals`: array of key bullish/bearish/neutral observations
- `risks`: array of explicit risks/constraints
- `feed_health`: per-source status (`ok|degraded|down`)
- `confidence`: `high|medium|low`
- `generated_at`: ISO 8601 timestamp

If the skill already defines a stricter schema above, that schema is authoritative.

## Failure Handling

- If one data source fails, continue with remaining sources and downgrade confidence.
- If critical sources are unavailable, return partial output with clear `feed_health` degradation details.
- Never fabricate missing data; mark unavailable fields explicitly.
- If all core sources fail, return a hard failure response with actionable remediation steps.

