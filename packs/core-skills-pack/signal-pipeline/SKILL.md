---
name: signal-pipeline
description: "Research-to-strategy handoff manager for WrenOS. Ensures discovery results flow to strategy evaluation, manages inbox routing between research and trading agents, handles data retention and snapshot generation, and monitors pipeline health. The glue between Category 1 research skills and Category 2 trading skills."
---

# Signal Pipeline

The glue between research and trading. Ensures discovery watchlists, graduation events, whale alerts, and narrative signals flow from your research skills into your strategy evaluation pipeline — reliably, on time, and in the right format.

## How It Works

Research skills (solana-token-discovery, pump-fun-monitor, whale-tracker, crypto-news-scanner, token-deep-dive) produce output files in `inbox/`. Trading skills (strategy-builder, risk-manager) consume those files. The signal pipeline manages that handoff — routing files, validating schemas, tracking delivery, handling retention, and alerting when the pipeline breaks.

In a single-agent setup, this is simple file management within one workspace. In a multi-agent setup (separate research and trading agents), the pipeline manages cross-workspace file delivery.

You don't interact with this skill directly most of the time. It runs in the background ensuring signals flow. You notice it when something breaks — which is the point.

**Examples:**
```
"Is the signal pipeline healthy?"
"What signals reached the trading agent today?"
"Show me pipeline throughput"
"Why isn't my trading agent seeing discovery results?"
"Clear stale signals older than 24 hours"
```

## What It Manages

### Inbox Routing

Research skills write output files to `inbox/`:
- `inbox/meme-watchlist-{timestamp}.json` (from solana-token-discovery)
- `inbox/graduation-monitor-{timestamp}.json` (from pump-fun-monitor)
- `inbox/whale-tracker-{timestamp}.json` (from whale-tracker)
- `inbox/news-scanner-{timestamp}.json` (from crypto-news-scanner)
- `inbox/deep-dive-{symbol}-{timestamp}.json` (from token-deep-dive)

In a multi-agent setup, the pipeline ensures these files are written to the trading agent's inbox (e.g., `~/.openclaw/workspace-trading/inbox/`), not just the research agent's own workspace.

### Schema Validation

Each handoff file has an expected schema. The pipeline validates:
- Required top-level fields are present (`ts`, `type`, `watchlist`/`alerts`/etc.)
- `feed_health` block is present and well-formed
- Token identity uses `chain:address` format
- Timestamps are valid ISO 8601
- Score values are in expected ranges (0-1)

Invalid files are quarantined (moved to `inbox/quarantine/`) and the operator is alerted. This prevents bad data from entering the strategy pipeline.

### Delivery Tracking

The pipeline tracks whether each signal file was:
- **Produced** — research skill wrote the file
- **Delivered** — file reached the trading agent's inbox
- **Consumed** — trading agent read and processed the file
- **Acted on** — trading agent produced a backtest or trade based on the signal

This creates an end-to-end audit trail from discovery to execution.

### Data Retention

Inbox files accumulate. The pipeline manages retention:

| File Type | Default Retention | Configurable |
|---|---|---|
| Watchlists | 7 days | Yes |
| Graduation events | 7 days | Yes |
| Whale alerts | 7 days | Yes |
| News scanner output | 3 days | Yes |
| Deep dive reports | 14 days | Yes |
| Quarantined files | 30 days | Yes |

Expired files are deleted. Retention is configurable per file type.

### Snapshot Generation

The pipeline can produce point-in-time snapshots of the complete signal state — a single file that captures the latest output from every active research skill. Useful for:
- Strategy backtesting (reproduce the signal environment at a given moment)
- Debugging (what did the trading agent see when it made a decision?)
- Archiving (daily signal state for historical analysis)

Snapshots are stored in `inbox/snapshots/signal-snapshot-{timestamp}.json`.

## Pipeline Health

The pipeline monitors its own health:

| Check | Description | Alert On |
|---|---|---|
| **Production gap** | Time since last file from each research skill | No output for 2x expected interval |
| **Delivery gap** | Time since last file reached trading inbox | File produced but not delivered |
| **Schema failures** | Files failing validation | Any quarantined file |
| **Consumption lag** | Files delivered but not consumed | Files older than 1 hour unconsumed |
| **Stale data** | Latest signal file is older than expected | Data older than 2x scan interval |

### Pipeline Status (Telegram)

```
📡 SIGNAL PIPELINE — Status

Production:
  ✅ token-discovery: last 28m ago (30m cycle)
  ✅ pump-monitor: last 45s ago (1m cycle)
  ✅ whale-tracker: last 12m ago (15m cycle)
  ✅ news-scanner: last 8m ago (15m cycle)
  ⚪ deep-dive: on-demand (last 4h ago)

Delivery:
  ✅ All files reaching trading inbox
  
Consumption:
  ✅ 12 files consumed today
  ⚠️ 1 watchlist unconsumed (48m old)

Schema: ✅ 0 quarantined
Retention: 34 files on disk (oldest: 5d)

Throughput (24h): 
  48 watchlists | 1,440 pump scans | 96 whale checks | 
  96 news scans | 2 deep dives
```

## Output Format

### Pipeline State File

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "signal-pipeline-state",
  "production": {
    "solana-token-discovery": {
      "lastProduced": "2026-03-10T07:32:00.000Z",
      "expectedIntervalMins": 30,
      "status": "healthy"
    },
    "pump-fun-monitor": {
      "lastProduced": "2026-03-10T07:59:15.000Z",
      "expectedIntervalMins": 1,
      "status": "healthy"
    },
    "whale-tracker": {
      "lastProduced": "2026-03-10T07:48:00.000Z",
      "expectedIntervalMins": 15,
      "status": "healthy"
    },
    "crypto-news-scanner": {
      "lastProduced": "2026-03-10T07:52:00.000Z",
      "expectedIntervalMins": 15,
      "status": "healthy"
    },
    "token-deep-dive": {
      "lastProduced": "2026-03-10T04:00:00.000Z",
      "expectedIntervalMins": null,
      "status": "on_demand"
    }
  },
  "delivery": {
    "filesDelivered24h": 1682,
    "deliveryFailures24h": 0,
    "status": "healthy"
  },
  "consumption": {
    "filesConsumed24h": 1680,
    "unconsumedCount": 2,
    "oldestUnconsumed": "2026-03-10T07:12:00.000Z"
  },
  "schema": {
    "quarantinedCount": 0,
    "lastQuarantineEvent": null
  },
  "retention": {
    "totalFilesOnDisk": 34,
    "oldestFile": "2026-03-05T08:00:00.000Z",
    "diskUsageMb": 2.4
  },
  "feed_health": {
    "pipeline": "ok"
  }
}
```

**Output location:** `memory/signal-pipeline-state.json` (overwritten each cycle)

### Heartbeat Compatibility

The pipeline state and `feed_health` block are readable by heartbeat-monitor. Pipeline health is included in the daily brief.

## User Configuration

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `retentionDaysWatchlist` | 7 | 1 - 30 | Days to keep watchlist files |
| `retentionDaysGraduation` | 7 | 1 - 30 | Days to keep graduation event files |
| `retentionDaysWhale` | 7 | 1 - 30 | Days to keep whale tracker files |
| `retentionDaysNews` | 3 | 1 - 14 | Days to keep news scanner files |
| `retentionDaysDeepDive` | 14 | 1 - 30 | Days to keep deep dive files |
| `retentionDaysQuarantine` | 30 | 7 - 90 | Days to keep quarantined files |
| `enableSchemaValidation` | true | true/false | Validate handoff file schemas |
| `enableDeliveryTracking` | true | true/false | Track file delivery and consumption |
| `enableSnapshots` | false | true/false | Generate daily signal snapshots |
| `snapshotTime` | "00:00" | HH:MM | When to generate daily snapshot |
| `productionGapMultiplier` | 2.0 | 1.5 - 5.0 | Alert when no output for N × expected interval |
| `consumptionLagMins` | 60 | 15 - 240 | Alert when delivered file unconsumed for this long |

### Example Conversations

**Checking health:**
```
User: "Is the signal pipeline healthy?"
Agent: "📡 SIGNAL PIPELINE — healthy.
        All 4 research skills producing on schedule.
        All files reaching trading inbox. 
        2 files unconsumed (48m old — within tolerance).
        0 schema failures. 34 files on disk."
```

**Debugging a gap:**
```
User: "Why isn't my trading agent seeing discovery results?"
Agent: "Investigating...
        
        token-discovery last produced 3h ago (expected: 30m).
        Likely cause: cron job stopped or feed failure.
        
        Checking... cron job 'token-discovery' last ran 3h ago 
        and logged: 'agenti-lite error — connection timeout'.
        
        Fix: agenti-lite feed is down. Heartbeat shows 
        walletAnalytics: error since 3h ago.
        Pipeline is not the problem — the feed is."
```

**Cleaning up:**
```
User: "Clear stale signals older than 24 hours"
Agent: "Cleared 28 files older than 24h.
        Remaining: 6 files on disk (newest: 12m ago).
        Retention policy unchanged (7d default still applies 
        for future cleanup)."
```

## Scheduling

```bash
openclaw cron create --name "signal-pipeline" \
  --expression "*/5 * * * *" \
  --mandate "Run signal-pipeline health check. Validate inbox 
             files, track delivery/consumption, run retention 
             cleanup, update pipeline state. Alert on issues."
```

The 5-minute interval keeps pipeline monitoring tighter than the heartbeat's 30-minute cycle, since signal delivery gaps can compound quickly.

## Requirements

### MCP Servers

None required. Reads and manages local workspace files only.

### API Keys

None required.

### Prerequisites

At least one research skill actively producing output. The pipeline has nothing to manage on a fresh install with no active research skills.

## Privacy

- No prompt or completion content is logged
- Pipeline state stored locally only
- Signal files are never sent externally — only routed between local workspaces
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| Inbox directory missing | Create it, log, continue |
| File permissions error | Alert operator with specific path |
| Schema validation failure | Quarantine file, alert operator |
| Disk space concern | Alert when retention files exceed 100MB |
| Cross-workspace write blocked | Alert operator — likely permissions issue |

## Data Retention

- `signal-pipeline-state.json`: overwritten each cycle
- Signal snapshots: 30 days (if enabled)
- Quarantined files: configurable (default 30 days)
- All pipeline files excluded from git by default

## Relationship to Other Skills

### Reads from: all Category 1 Research Skills
Pipeline monitors output from token-discovery, pump-monitor, whale-tracker, news-scanner, and deep-dive.

### Routes to: all Category 2 Trading Skills
Pipeline ensures signal files reach the trading agent's inbox where strategy-builder, risk-manager, and trailing-stop can consume them.

### Reports to: heartbeat-monitor
Heartbeat reads pipeline state for its health aggregation and daily brief.

## What This Skill Does NOT Do

- **Does not produce signals.** It routes and manages signals produced by research skills.
- **Does not evaluate strategies.** It ensures signals reach strategy-builder. Evaluation is strategy-builder's job.
- **Does not trade.** It is infrastructure, not execution.
- **Does not require any API keys or MCP servers.** Manages local files only.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Routes from:** all Category 1 Research Skills
- **Routes to:** all Category 2 Trading Skills
- **Reports to:** heartbeat-monitor

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install signal-pipeline
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Set up cron: `*/5 * * * *`
3. Pipeline will auto-discover inbox files from other skills

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

