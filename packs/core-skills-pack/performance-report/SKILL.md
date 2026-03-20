---
name: performance-report
description: "Automated PnL and portfolio performance reporting for WrenOS. Produces daily and weekly summaries with per-strategy breakdowns, drawdown status, win/loss analysis, and portfolio health metrics. Delivered to Telegram on a configurable schedule."
---

# Performance Report

Automated performance summaries for your trading agent. Produces daily and weekly reports with per-strategy PnL breakdowns, drawdown tracking, win/loss analysis, and portfolio health — delivered to Telegram on your schedule.

## How It Works

The agent reads trade history, open position state, and strategy zoo data, then compiles a structured performance report and sends it to Telegram. You set the schedule and detail level. Reports cover everything from a quick daily PnL summary to a detailed weekly breakdown with per-strategy metrics and regime analysis.

**Examples:**
```
"Send me a daily summary at 8am"
"Weekly performance report every Sunday"
"How did I do this week?"
"Show me per-strategy PnL breakdown"
"What's my best and worst trade this week?"
```

## Report Types

### Daily Summary
Quick overview of the last 24 hours.

```
📈 DAILY PERFORMANCE — 2026-03-10

Portfolio: $7,982 (+$142 / +1.81%)
Peak: $8,015 | DD from peak: -0.4%

Trades: 5 closed (3 wins, 2 losses)
Win rate: 60% | Avg win: +8.2% | Avg loss: -3.8%
Best: WOJAK +14.2% ($170)
Worst: CATZ -5.1% (-$41)

Open positions: 2
  BONK: +3.2% ($26)
  AGNT: -1.1% (-$9)

Strategy breakdown:
  my_momentum_v1: +$108 (3 trades, 67% WR)
  my_whale_trail_v0: +$34 (2 trades, 50% WR)

Feeds: 6/7 healthy (LunarCrush degraded — enrichment)
```

### Weekly Report
Detailed breakdown with trends, per-strategy analysis, and insights.

```
📊 WEEKLY PERFORMANCE — 2026-03-04 to 2026-03-10

Portfolio: $7,982 (started $7,210 / +$772 / +10.7%)
Peak: $8,115 | Worst DD: -3.8% (Mar 7)

Trades: 23 closed (14 wins, 9 losses)
Win rate: 60.9% | Profit factor: 2.14
Avg win: +7.8% | Avg loss: -4.1%
Sharpe (weekly): 1.52

Strategy breakdown:
  my_momentum_v1:
    PnL: +$485 | Trades: 12 | WR: 67% | Avg edge: 112 bps
    Champion — holding rank
    
  my_whale_trail_v0:
    PnL: +$218 | Trades: 8 | WR: 50% | Avg edge: 74 bps
    Challenger — improving
    
  my_grad_play_v0:
    PnL: +$69 | Trades: 3 | WR: 67% | Avg edge: 58 bps
    Challenger — low volume

Top trades:
  1. WOJAK +14.2% ($170) — momentum entry, trail exit
  2. PEPE2 +11.8% ($142) — whale accum, take-profit
  3. BONK +9.4% ($113) — momentum entry, time exit

Worst trades:
  1. DOGE3 -8.2% (-$98) — momentum entry, hard stop
  2. CATZ -5.1% (-$41) — whale accum, trail exit
  3. MEME2 -4.6% (-$37) — momentum entry, trail exit

Risk summary:
  Max portfolio DD: -3.8% (limit: 15%)
  Max strategy DD: -5.2% my_whale_trail (limit: 10%)
  Kill switch: never triggered
  
Market regime: trending → ranging (shifted Mar 8)
Regime note: momentum strategies may underperform next week
```

### On-Demand Snapshot
Ask anytime for current state.

```
User: "How am I doing?"
Agent: "This week so far: +$542 (+7.5%), 15 trades, 
        60% win rate. Momentum strategy carrying most of 
        the PnL. No risk issues. Want the full breakdown?"
```

## Data Sources

The performance report reads from other skills' state files:

| Data | Source |
|---|---|
| Trade history | Strategy-builder's backtest/trade logs in `strategies/` |
| Open positions | Risk-manager's `risk-state.json` |
| Exit events | Trailing-stop's exit event logs |
| Portfolio state | Risk-manager's portfolio tracking |
| Zoo rankings | Strategy-builder's `zoo-leaderboard.json` |
| Feed health | Heartbeat-monitor's `heartbeat-state.json` |

No MCP servers or API keys needed — all data is read from local workspace files.

## Output Format

### Report File

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "performance-report",
  "period": "daily",
  "window": { "start": "2026-03-09", "end": "2026-03-10" },
  "portfolio": {
    "startEquity": 7840,
    "endEquity": 7982,
    "pnlUsd": 142,
    "pnlPct": 1.81,
    "peakEquity": 8015,
    "drawdownFromPeakPct": 0.4
  },
  "trades": {
    "closed": 5,
    "wins": 3,
    "losses": 2,
    "winRate": 0.60,
    "avgWinPct": 8.2,
    "avgLossPct": -3.8,
    "profitFactor": 2.14,
    "bestTrade": { "token": "WOJAK", "pnlPct": 14.2, "pnlUsd": 170 },
    "worstTrade": { "token": "CATZ", "pnlPct": -5.1, "pnlUsd": -41 }
  },
  "strategies": [
    {
      "name": "my_momentum_v1",
      "pnlUsd": 108,
      "trades": 3,
      "winRate": 0.67,
      "avgEdgeBps": 112,
      "status": "champion"
    },
    {
      "name": "my_whale_trail_v0",
      "pnlUsd": 34,
      "trades": 2,
      "winRate": 0.50,
      "avgEdgeBps": 74,
      "status": "challenger"
    }
  ],
  "openPositions": 2,
  "risk": {
    "maxPortfolioDD": 0.4,
    "maxStrategyDD": 2.1,
    "killSwitchTriggered": false,
    "dailyDDBreached": false
  },
  "regime": "trending"
}
```

**Output location:** `reports/performance-{period}-{date}.json`

### Heartbeat Compatibility

Heartbeat-monitor reads the latest performance report for the daily brief's PnL section.

## User Configuration

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `dailyReportTime` | "08:00" | HH:MM | When to send daily report (local time) |
| `weeklyReportDay` | "sunday" | day of week | When to send weekly report |
| `weeklyReportTime` | "09:00" | HH:MM | Time for weekly report |
| `enableDailyReport` | true | true/false | Send daily reports |
| `enableWeeklyReport` | true | true/false | Send weekly reports |
| `verbosity` | "standard" | brief / standard / detailed | Report detail level |
| `includeOpenPositions` | true | true/false | Show open positions in report |
| `includeTopTrades` | true | true/false | Show best/worst trades |
| `includeRegimeAnalysis` | true | true/false | Include market regime commentary |
| `topTradesCount` | 3 | 1 - 10 | Number of top/bottom trades to show |

### Example Conversations

**Setting schedule:**
```
User: "Send me a daily summary at 8am and weekly on Sunday"
Agent: "Performance reports scheduled:
        Daily: 8:00 AM local time
        Weekly: Sunday 9:00 AM local time
        Active immediately."
```

**Changing detail:**
```
User: "Make the daily report shorter — just PnL and trade count"
Agent: "Daily report set to 'brief' mode. 
        You'll get: portfolio PnL, trade count, win rate, 
        and any risk alerts. No per-strategy breakdown."
```

**On-demand:**
```
User: "How did my whale strategy do this week?"
Agent: "my_whale_trail_v0 this week:
        PnL: +$218 | Trades: 8 | Win rate: 50%
        Avg edge: 74 bps | Max DD: -5.2%
        Best: PEPE2 +11.8% | Worst: CATZ -5.1%
        Status: challenger (rank #2)"
```

## Scheduling

```bash
# Daily report
openclaw cron create --name "daily-performance" \
  --expression "0 8 * * *" \
  --mandate "Run performance-report daily summary. 
             Send to Telegram."

# Weekly report
openclaw cron create --name "weekly-performance" \
  --expression "0 9 * * 0" \
  --mandate "Run performance-report weekly breakdown. 
             Include per-strategy analysis and regime notes. 
             Send to Telegram."
```

## Requirements

### MCP Servers

None required. Reads local workspace files only.

### API Keys

None required.

### Prerequisites

- At least one strategy with trade history (strategy-builder)
- Risk state file present (risk-manager)

### WrenOS Components

No vendor dependencies. Reads from other skills' output files.

## Privacy

- No prompt or completion content is logged
- Performance data stored locally only
- Trade history never sent externally
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| No trade history found | Report "no trades in period" — not an error |
| Risk state file missing | Report portfolio section as "unavailable" |
| Strategy zoo empty | Report strategies section as "no active strategies" |
| Telegram notification fails | Log error, retry next cycle |

## Data Retention

- Daily reports: 30 days, then rotated
- Weekly reports: 90 days, then rotated
- All report files excluded from git by default

## Relationship to Other Skills

### Reads from: strategy-builder, risk-manager, trailing-stop, heartbeat-monitor
Performance report aggregates data from trading and infrastructure skills into a readable summary.

### Writes to: operator (Telegram), heartbeat-monitor
Heartbeat reads performance data for its daily brief.

## What This Skill Does NOT Do

- **Does not trade.** It reports on trades that already happened.
- **Does not optimize.** That's portfolio-optimizer's job.
- **Does not enforce risk.** That's risk-manager's job.
- **Does not require any API keys or MCP servers.** Reads local files only.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Reads from:** strategy-builder, risk-manager, trailing-stop, heartbeat-monitor

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install performance-report
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Set up cron for daily/weekly schedules
3. Tell your agent: "Send me a daily summary at 8am"

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

