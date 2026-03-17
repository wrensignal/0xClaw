---
name: heartbeat-monitor
description: "Health monitoring and supervisor loop for WrenOS. Checks all data feeds, strategy status, portfolio state, and agent health on a configurable cycle. Sends Telegram alerts when anything degrades. Auto-remediates local fixable issues. Escalates to the operator on safety/policy concerns. The always-on watchdog that keeps the system healthy."
---

# Heartbeat Monitor

The always-on watchdog for your WrenOS agent stack. Checks data feeds, strategy health, portfolio state, and agent status on a regular cycle — then alerts you when something needs attention. Fixes what it can, escalates what it can't.

## How It Works

The heartbeat runs on a configurable cycle (default: every 30 minutes). Each cycle, it reads the state of every other skill and data source, checks for degradation, and produces a health summary. If everything is fine, it logs a quiet OK. If something is wrong, it alerts you in Telegram with the issue and recommended action.

You don't configure this skill — it just runs. It reads the `feed_health` blocks from every other skill's output and monitors the overall system.

**Examples:**
```
"What's the system health?"
"Are all my feeds working?"
"Show me the daily brief"
"What broke since yesterday?"
```

## What It Monitors

### Data Feed Health
Reads `feed_health` from every active skill's latest output:

| Skill | Feeds Checked |
|---|---|
| solana-token-discovery | agenti-lite (wallet analytics, DEX), Helius, Birdeye, LunarCrush, crypto-news-lite, pump-fun-sdk-lite |
| pump-fun-monitor | pump-fun-sdk-lite, Helius (creator analysis) |
| token-deep-dive | all configured sources |
| crypto-news-scanner | crypto-news-lite, agenti-lite social, LunarCrush |
| whale-tracker | agenti-lite wallet analytics, crypto-news-lite whale tools, Helius |
| solana-token-scan | token-deep-dive + whale-tracker + pump-fun-monitor + crypto-news-scanner aggregate health |

For each feed, the heartbeat tracks: current status, time since last successful response, degradation duration, whether an alternate source is active, and recovery attempts.

### Strategy Zoo Health
Reads from strategy-builder's zoo state files:
- Is the champion strategy still passing gates?
- Are any challengers failing repeatedly?
- Has the market calibration been updated recently?
- Are nightly reviews running on schedule?

### Portfolio & Risk Health
Reads from risk-manager's state:
- Current portfolio drawdown vs limits
- Any strategies in DD pause?
- Kill switch status
- Open position count vs limits
- Daily drawdown status

### Agent Health
Checks that the agent's own infrastructure is functioning:
- Cron jobs running on schedule
- Memory files being written
- Inbox files being produced by research skills
- No stale data (files updated within expected windows)

## Heartbeat Cycle

### Fast Path
If no material changes since the last check (no file modifications in any monitored workspace), the heartbeat logs `HEARTBEAT_OK` and exits. No Telegram notification on quiet cycles.

### Full Check
If changes are detected, the heartbeat runs the full check sequence:

1. Read latest output from each active skill
2. Check `feed_health` blocks for degradation
3. Check strategy zoo state
4. Check risk/portfolio state
5. Check cron/schedule health
6. Auto-remediate local fixable issues (stale config, schema mismatch, timeout retry)
7. Produce health summary
8. Alert on issues or escalate to operator

### Quiet Hours
Configurable quiet hours (default: 23:00–08:00 local time). During quiet hours, the heartbeat skips unless an urgent condition is detected. Urgent = safety issue, policy drift, repeated failure, unexpected transfer, or live mode without approval.

## Alert Severity

| Severity | Examples | Action |
|---|---|---|
| **Critical** | Kill switch triggered, unexpected transfer, policy drift, live mode without approval | Immediate Telegram alert, always (even quiet hours) |
| **Warning** | Feed degraded 24h+, strategy failing gates, portfolio DD approaching limit | Telegram alert on next heartbeat cycle |
| **Info** | Feed recovered, strategy promoted, nightly review completed | Included in daily brief, no standalone alert |
| **OK** | Everything healthy | No notification (logged only) |

## Feed Degradation Tracking

For each feed currently degraded, the heartbeat tracks:

```json
{
  "name": "helius",
  "status": "degraded",
  "degradedSince": "2026-03-09T14:00:00Z",
  "alternateActive": false,
  "alternateWorking": false,
  "lastRecoveryCheck": "2026-03-10T08:00:00Z",
  "recoveryAttempts": 4
}
```

**Escalation policy:**
- Degraded < 24h with working alternate: monitor only
- Degraded 24-48h with working alternate: log, monitor
- Degraded 48h+ with no working alternate: escalate to operator with recommendation

On recovery: log event, confirm downstream skills are using recovered feed, verify data quality.

## Auto-Remediation

The heartbeat fixes local issues without waiting for operator input:

| Issue | Fix | Report |
|---|---|---|
| Stale config file | Regenerate from current state | Log fix + verification |
| Schema mismatch in handoff files | Repair or flag for next skill run | Log fix |
| Cron job missed a cycle | Re-trigger manually | Log + verify |
| Timeout on feed check | Retry with backoff | Log attempt |
| Known-degraded feed recovered | Update tracker, notify | Log recovery |

For anything external, sensitive, or ambiguous: escalate instead of fixing.

## Daily Brief

Once per morning (configurable window, default 07:00–11:00 local time), the heartbeat produces a comprehensive daily brief:

```
📋 DAILY BRIEF — 2026-03-10

System Health: ✅ all clear

Research:
  Token discovery: 3 watchlists produced (top score: 0.84)
  Pump monitor: 12 graduations tracked, 2 alerts sent
  News scanner: 4 narrative alerts, trending: AI agents
  Whale tracker: 2 accumulation patterns detected

Strategies:
  Zoo: 3 active, champion 'my_momentum_v1' (105 bps)
  Nightly review: completed 02:14 — no changes
  Gate status: all passing

Portfolio:
  Equity: $7,840 | Deployed: 24.5%
  PnL (24h): +$142 (+1.8%)
  DD from peak: -1.2% (limit: 15%)
  Open positions: 2 of 3

Feeds: 6 healthy, 1 degraded (LunarCrush — 18h, enrichment only)

Recommendations:
  - LunarCrush degraded but non-critical (enrichment source)
  - Consider rebalance — drift 12% from optimal

Risks: none critical
```

## Output Format

### Heartbeat State File

```json
{
  "ts": "2026-03-10T08:30:00.000Z",
  "type": "heartbeat",
  "status": "ok",
  "cycle": 847,
  "feeds": {
    "walletAnalytics": "ok",
    "dexAnalytics": "ok",
    "pumpFun": "ok",
    "cryptoNews": "ok",
    "helius": "not_configured",
    "birdeye": "not_configured",
    "lunarcrush": "degraded"
  },
  "feedDegradations": [
    {
      "name": "lunarcrush",
      "status": "degraded",
      "degradedSince": "2026-03-09T14:00:00Z",
      "severity": "info",
      "note": "enrichment source, non-critical"
    }
  ],
  "zoo": {
    "activeStrategies": 3,
    "championPassing": true,
    "nightlyReviewLast": "2026-03-10T02:14:00Z"
  },
  "portfolio": {
    "equityUsd": 7840,
    "deployedPct": 24.5,
    "drawdownFromPeakPct": 1.2,
    "killSwitch": false
  },
  "agents": {
    "cronHealthy": true,
    "lastMemoryWrite": "2026-03-10T08:28:00Z",
    "lastInboxFile": "2026-03-10T08:00:00Z"
  },
  "alerts": [],
  "remediations": []
}
```

**Output location:** `memory/heartbeat-state.json` (overwritten each cycle)

**Daily brief location:** `memory/daily-brief-{date}.json`

## User Configuration

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `heartbeatIntervalMins` | 30 | 5 - 60 | How often the full heartbeat runs |
| `quietHoursStart` | "23:00" | HH:MM | Start of quiet hours (local time) |
| `quietHoursEnd` | "08:00" | HH:MM | End of quiet hours (local time) |
| `dailyBriefWindow` | "07:00-11:00" | HH:MM-HH:MM | Window for daily brief generation |
| `feedDegradationEscalateHours` | 48 | 12 - 168 | Hours of degradation before escalation |
| `enableAutoRemediation` | true | true/false | Allow heartbeat to fix local issues |
| `enableDailyBrief` | true | true/false | Produce daily brief |

### Example Conversations

**On-demand health check:**
```
User: "System health?"
Agent: "✅ All healthy. 6 feeds ok, 1 degraded (LunarCrush, 
        18h — enrichment only). Zoo: 3 strategies, champion 
        passing. Portfolio: $7,840, 1.2% DD. No alerts."
```

**Investigating an issue:**
```
User: "What broke?"
Agent: "1 issue: LunarCrush API returning 429 since yesterday 
        14:00. This is an enrichment source — discovery and 
        scoring continue without it. Social signals from 
        crypto-news-lite are unaffected. 
        No action needed unless you want enhanced per-token 
        social metrics."
```

## Scheduling

```bash
openclaw cron create --name "heartbeat" \
  --expression "*/30 * * * *" \
  --mandate "Run heartbeat-monitor cycle. Check all feeds, 
             strategy zoo, portfolio state, and agent health. 
             Alert on issues. Auto-remediate local fixes. 
             Produce daily brief if in morning window."
```

## Requirements

### MCP Servers

No MCP servers required. The heartbeat reads output files from other skills — it doesn't query data sources directly.

### API Keys

None required.

### Prerequisites

At least one other skill actively running and producing output files. The heartbeat has nothing to monitor on a fresh install with no active skills.

## Privacy

- No prompt or completion content is logged
- Health state stored locally in agent workspace only
- No external data queries — reads local files only
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| Skill output file missing | Mark that skill's feeds as "unknown", note in report |
| Heartbeat itself fails | OpenClaw cron will retry next cycle — heartbeat is stateless |
| Daily brief generation fails | Retry on next cycle within window |
| All feeds degraded simultaneously | Likely infrastructure issue — escalate immediately |

## Data Retention

- `heartbeat-state.json`: overwritten each cycle
- Daily briefs: 30 days, then rotated
- Feed degradation tracker: persistent until resolved
- All heartbeat files excluded from git by default

## Relationship to Other Skills

### Reads from: all other skills
Heartbeat consumes `feed_health` blocks and state files from every active skill. It is the central health aggregator.

### Writes to: operator (Telegram)
Heartbeat output is alerts and briefs delivered to the operator. It does not write to other skills.

## What This Skill Does NOT Do

- **Does not query data sources.** It reads other skills' output files. If no skills are running, there's nothing to monitor.
- **Does not trade.** It monitors and reports.
- **Does not modify strategies.** It reports strategy health. Changes are made through strategy-builder.
- **Does not require any API keys.** Reads local files only.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Reads from:** all Category 1, 2, and 3 skills

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install heartbeat-monitor
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Set up cron: `*/30 * * * *`
3. Heartbeat will auto-discover other skill outputs in the workspace
