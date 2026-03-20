---
name: pump-fun-monitor
description: "Real-time pump.fun bonding curve monitor for WrenOS. Tracks tokens approaching graduation, detects buy acceleration, monitors creator behavior, and alerts users via Telegram when configurable thresholds are crossed. Outputs the WrenOS graduation-event handoff format for downstream skills."
---

# Pump.fun Monitor

Real-time graduation radar for pump.fun tokens on Solana. Tracks bonding curve progress, detects buy acceleration, flags creator behavior, and alerts you when tokens are about to graduate.

## How It Works

You tell your agent what graduation signals matter to you. The agent watches pump.fun continuously, tracks bonding curve completion across all active tokens, computes buy velocity and acceleration, and alerts you in Telegram when your thresholds are crossed.

This is not a discovery skill — it's a surveillance skill. It watches a specific event type (graduation) and tells you when something is happening right now. Solana-token-discovery finds what to watch. Pump-fun-monitor tells you when to act.

**Examples:**
```
"Alert me when any token hits 85% curve completion with accelerating buys"
"Watch pump.fun for tokens graduating in the next 10 minutes"
"Track all tokens above 70% curve — show me buy velocity"
"Alert me on graduations where unique buyer count is above 200"
"Ignore tokens where the creator has sold more than 20% of supply"
"Show me everything that graduated in the last hour"
```

## Core Concepts

### Bonding Curve Completion

Every pump.fun token starts at 0% and graduates at 100%. The curve maps SOL deposited to tokens minted — as more SOL flows in, the price rises along a deterministic curve until the token graduates to Raydium with a real liquidity pool.

**Why this matters:** Graduation is the single highest-signal event in meme token lifecycle. Pre-graduation tokens are illiquid and high-risk. Post-graduation tokens have real DEX liquidity. The transition window — 70% to 100% — is where the most asymmetric entries exist.

### Buy Velocity & Acceleration

**Velocity** = number of buys per time window (e.g., 15 buys/minute).
**Acceleration** = rate of change of velocity (e.g., velocity doubled in the last 5 minutes).

A token at 80% curve with flat velocity might take hours to graduate. A token at 80% with accelerating velocity might graduate in minutes. The monitor tracks both.

### Creator Behavior

The deployer wallet's behavior is the strongest negative signal in pump.fun tokens:
- Creator selling during curve → likely dump at graduation
- Creator holding through graduation → more aligned with buyers
- Creator wallet concentration → single-actor risk

## Monitoring Modes

### Graduation Watch (default)
Continuous scan for tokens approaching graduation.
```
"Watch for tokens about to graduate"
```
**Tracks:** All tokens above curve threshold (default 70%)
**Alerts on:** Curve crossing alert threshold (default 85%) + velocity confirmation
**Pipeline:** Curve scan → threshold filter → velocity check → creator filter → alert

### Velocity Spike Detection
Find tokens where buy pressure is suddenly accelerating regardless of curve position.
```
"Alert me when any pump.fun token has a buy velocity spike"
```
**Tracks:** Buy velocity across all active tokens
**Alerts on:** Velocity exceeds `velocityThreshold` or acceleration exceeds `accelerationThreshold`
**Pipeline:** Velocity scan → spike detection → curve enrichment → creator filter → alert

### Recent Graduations
Review tokens that just graduated — useful for catching post-graduation momentum.
```
"Show me everything that graduated in the last hour"
```
**Returns:** All tokens that crossed 100% in the lookback window
**Enriched with:** Final buy velocity, unique buyer count, creator wallet status, time-to-graduate

### Creator Watchlist
Track specific deployer wallets known for successful or suspicious launches.
```
"Watch these creator wallets for new launches: [addresses]"
```
**Tracks:** New token deployments from specified wallets
**Alerts on:** New token created + curve progress updates

### Custom Thresholds
Combine any conditions.
```
"Alert me when curve is above 80%, buy velocity is above 20/min, 
 unique buyers exceed 150, and creator hasn't sold"
```
The agent assembles a custom monitoring rule from the conditions specified.

## Signal Data

### Bonding Curve Data
| Field | Type | Description |
|---|---|---|
| `curveCompletion` | float (0-1) | Percentage of bonding curve filled |
| `solDeposited` | float | Total SOL deposited into curve |
| `solTarget` | float | SOL needed for graduation |
| `solRemaining` | float | SOL gap to graduation |
| `isGraduated` | boolean | Whether token has graduated |
| `graduatedAt` | timestamp | Graduation time (null if not graduated) |
| `estimatedTimeToGrad` | string | Estimate based on current velocity |

### Velocity Data
| Field | Type | Description |
|---|---|---|
| `buyCount5m` | int | Buys in last 5 minutes |
| `buyCount15m` | int | Buys in last 15 minutes |
| `buyCount1h` | int | Buys in last 1 hour |
| `velocity5m` | float | Buys per minute (5m window) |
| `velocity15m` | float | Buys per minute (15m window) |
| `acceleration` | float | Ratio of velocity5m / velocity15m. >1 = accelerating, <1 = decelerating |
| `uniqueBuyers5m` | int | Distinct wallets buying in 5m window |
| `uniqueBuyers1h` | int | Distinct wallets buying in 1h window |
| `avgBuySizeSol` | float | Average buy size in SOL (5m window) |

### Creator Behavior Data
| Field | Type | Description |
|---|---|---|
| `creatorAddress` | string | Deployer wallet address |
| `creatorHoldingPct` | float | Percentage of supply creator still holds |
| `creatorNetSellSol` | float | Net SOL value creator has sold |
| `creatorSellCount` | int | Number of sell transactions from creator |
| `creatorLastAction` | string | "buy" / "sell" / "hold" / "transfer" |
| `creatorLastActionAge` | string | Time since last creator transaction |
| `creatorRiskFlag` | string | "clean" / "caution" / "dump_risk" |

### Token Metadata
| Field | Type | Description |
|---|---|---|
| `mintAddress` | string | Token mint address |
| `symbol` | string | Token symbol |
| `name` | string | Token name |
| `createdAt` | timestamp | Token creation time |
| `tokenAgeMins` | int | Minutes since creation |
| `imageUri` | string | Token image URL |
| `description` | string | Token description from pump.fun |

## Filters & Gates

### Creator Risk Filter (enabled by default)

| Condition | Risk Flag | Default Action |
|---|---|---|
| Creator sold 0% | `clean` | Include |
| Creator sold < 10% of holding | `caution` | Include with flag |
| Creator sold > 20% of holding | `dump_risk` | Exclude |
| Creator transferred > 30% to fresh wallet | `dump_risk` | Exclude |

Thresholds are configurable. Users running contrarian or speed strategies can disable.

### Minimum Age Filter (enabled by default)

| Check | Default | Configurable | Purpose |
|---|---|---|---|
| Token age | >= 5 minutes | Yes | Avoid bot-created tokens that die instantly |

### Unique Buyer Floor (enabled by default)

| Check | Default | Configurable | Purpose |
|---|---|---|---|
| Unique buyers (1h) | >= 20 | Yes | Filters single-wallet wash trading |

### Velocity Confirmation (enabled by default for graduation watch)

Tokens are only alerted on if velocity is positive (at least 1 buy/min over the 5m window). Prevents alerts on stale tokens that crossed the curve threshold hours ago but have no current activity.

## Scoring

Each monitored token receives a graduation score (0 to 1) computed from the active signals. This is not a trade recommendation — it's a measure of graduation imminence and quality.

**Default weights:**

| Signal | Weight | Description |
|---|---|---|
| Curve Proximity | 35% | How close to 100% (exponential: 90% scores much higher than 70%) |
| Buy Acceleration | 25% | velocity5m / velocity15m ratio |
| Unique Buyer Breadth | 15% | Distinct buyers relative to token age |
| Buy Size Consistency | 10% | Uniform buy sizes > single large buy |
| Creator Behavior | 10% | Clean creator = full score, caution = 50%, dump_risk = 0% |
| Token Age | 5% | Sweet spot: 15min - 4h. Too young = untested, too old = stale |

**Weight redistribution:** If a signal source is unavailable (e.g., creator data fails), its weight redistributes proportionally across remaining signals. Same logic as solana-token-discovery.

**Score interpretation:**
- `0.85+` — High confidence graduation approaching with strong signals
- `0.70 - 0.84` — Graduation probable, some signals mixed
- `0.50 - 0.69` — Moderate — on track but velocity or breadth concerns
- `< 0.50` — Low imminence or poor quality signals

## Identity Resolution

Same as solana-token-discovery: every token keyed by `chain:address`, not symbol.

```
canonical key: solana:{mint_address}
display: {symbol} ({mint_address_short})
```

## Output Format

### Monitoring Alert (pushed to Telegram)

When a token crosses alert thresholds:

```
🎓 GRADUATION ALERT — WOJAK (5tN42n...)

Curve: 87% → est. 12 min to grad
Velocity: 23 buys/min (accelerating 1.8x)
Unique buyers (1h): 312
Creator: clean (holding 100%)
Graduation Score: 0.89

SOL remaining: 14.2 SOL
Avg buy size: 0.3 SOL
```

### Graduation Event (pushed to Telegram + file)

When a token actually graduates:

```
✅ GRADUATED — WOJAK (5tN42n...)

Graduated at: 2026-03-10T08:32:14Z
Time to graduate: 2h 14m
Final velocity: 31 buys/min
Total unique buyers: 487
Creator status: clean (holding 100%)
SOL deposited: 85 SOL
Raydium pool: [link]
```

### Watchlist File (handoff format)

Written to the agent's `inbox/` directory for downstream skill consumption. In a multi-agent WrenOS deployment, the research agent writes to the trading agent's inbox (e.g., `~/.openclaw/workspace-trading/inbox/`). In a single-agent setup, this is the agent's own workspace `inbox/`.

Follows the WrenOS graduation-event handoff schema:

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "graduation-monitor",
  "monitoringMode": "graduation_watch",
  "watchlist": [
    {
      "rank": 1,
      "symbol": "WOJAK",
      "address": "5tN42n9vM...",
      "chain": "solana",
      "graduationScore": 0.89,
      "curve": {
        "completion": 0.87,
        "solDeposited": 70.8,
        "solTarget": 85.0,
        "solRemaining": 14.2,
        "estimatedTimeToGrad": "12m"
      },
      "velocity": {
        "buyCount5m": 115,
        "velocity5m": 23.0,
        "velocity15m": 12.8,
        "acceleration": 1.80,
        "uniqueBuyers1h": 312,
        "avgBuySizeSol": 0.3
      },
      "creator": {
        "address": "Abc123...",
        "holdingPct": 1.0,
        "netSellSol": 0,
        "riskFlag": "clean"
      },
      "metadata": {
        "name": "WOJAK",
        "createdAt": "2026-03-10T06:18:00.000Z",
        "tokenAgeMins": 102
      },
      "evidence": "87% curve, 23 buys/min accelerating 1.8x, 312 unique buyers, creator clean",
      "invalidation": "Velocity drops below 5/min or creator starts selling"
    }
  ],
  "recentGraduations": [
    {
      "symbol": "PEPE2",
      "address": "7xQ93m...",
      "graduatedAt": "2026-03-10T07:48:22.000Z",
      "timeToGraduateMins": 134,
      "finalVelocity": 31.0,
      "totalUniqueBuyers": 487,
      "creatorRiskFlag": "clean"
    }
  ],
  "monitorStats": {
    "tokensTracked": 2847,
    "aboveThreshold": 12,
    "alertsSent": 3,
    "graduationsLastHour": 7
  },
  "feed_health": {
    "pumpFun": "ok",
    "creatorWalletLookup": "ok"
  },
  "config": {
    "activeSources": ["pump_fun", "creator_analysis"],
    "curveThreshold": 0.70,
    "alertThreshold": 0.85,
    "velocityThreshold": 5,
    "accelerationThreshold": 1.5,
    "minUniqueBuyers": 20,
    "creatorRiskMax": "caution",
    "scanIntervalSeconds": 30
  }
}
```

**Output location:** `inbox/graduation-monitor-{timestamp}.json`

Consumed by downstream skills (strategy-builder, risk-manager) or any agent that reads the graduation-event handoff schema.

### Heartbeat Compatibility

In a WrenOS multi-agent deployment, the `feed_health` block is readable by the heartbeat supervisor loop. The supervisor agent checks research workspace artifacts on each cycle and tracks feed degradation status. This skill's feed health output matches that expectation — the supervisor reads the latest graduation-monitor file and reports feed status in its daily brief.

If `pumpFun` feed status is `error` for 48+ hours with no working alternate, the supervisor will escalate to the operator per standard heartbeat escalation policy.

## User Configuration

All parameters are configurable through Telegram conversation.

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `curveThreshold` | 0.70 | 0.50 - 0.95 | Minimum curve completion to start tracking |
| `alertThreshold` | 0.85 | 0.60 - 0.98 | Graduation score threshold for Telegram alerts |
| `velocityThreshold` | 5 | 1 - 50 | Minimum buys/min to confirm activity |
| `accelerationThreshold` | 1.5 | 1.0 - 5.0 | Minimum velocity5m/velocity15m ratio for acceleration alert |
| `minUniqueBuyers` | 20 | 5 - 500 | Minimum unique buyers (1h) to pass filter |
| `minTokenAgeMins` | 5 | 1 - 60 | Minimum token age in minutes |
| `creatorRiskMax` | "caution" | clean / caution / dump_risk | Maximum creator risk flag to include |
| `creatorSellPctExclude` | 0.20 | 0.05 - 1.0 | Creator sell % that triggers exclusion |
| `scanIntervalSeconds` | 30 | 10 - 300 | How often to poll pump.fun data |
| `monitoringMode` | "graduation_watch" | see modes | Default monitoring approach |
| `enableVelocityConfirmation` | true | true/false | Require positive velocity for alerts |
| `enableCreatorFilter` | true | true/false | Filter by creator behavior |
| `graduationScoreWeights` | (see defaults) | must sum to 1.0 | Per-signal weights |
| `maxAlertsPerHour` | 10 | 1 - 50 | Rate limit on Telegram alerts |
| `recentGraduationLookbackMins` | 60 | 15 - 1440 | Lookback window for recent graduations |

### Example Conversations

**Getting started:**
```
User: "Start watching pump.fun for graduations"
Agent: "Graduation watch active. Tracking tokens above 70% curve 
        completion, alerting at 85%+ graduation score with velocity 
        confirmation. Scanning every 30 seconds."
```

**Tightening filters:**
```
User: "Only alert me on really strong setups — 90%+ score, 
       at least 100 unique buyers, creator must be clean"
Agent: "Updated: alert threshold 0.90, unique buyer floor 100, 
        creator filter set to 'clean' only. Monitoring."
```

**Switching modes:**
```
User: "Switch to velocity spike detection — I want to catch 
       early momentum regardless of curve position"
Agent: "Switched to velocity spike mode. Alerting when any token 
        hits 20+ buys/min with 2x+ acceleration. No curve threshold 
        required."
```

**Creator tracking:**
```
User: "Watch this creator wallet for new launches: Abc123..."
Agent: "Added Abc123... to creator watchlist. I'll alert you when 
        they deploy a new token and track its progress."
```

**Reviewing recent activity:**
```
User: "What graduated in the last hour?"
Agent: "7 tokens graduated in the last 60 minutes. Top 3 by quality:
        1. PEPE2 — 487 buyers, 31/min velocity, creator clean
        2. DOGE3 — 203 buyers, 18/min velocity, creator clean  
        3. CATZ — 89 buyers, 12/min velocity, creator caution
        Want details on any of these?"
```

## Scheduling

This skill needs higher-frequency polling than the standard 30-minute WrenOS heartbeat cycle. It runs on a short-interval OpenClaw cron job that re-invokes the agent on each tick:

```bash
openclaw cron create --name "pump-fun-monitor" \
  --expression "*/1 * * * *" \
  --mandate "Run pump-fun-monitor scan cycle with current user config. 
             Check bonding curves, alert on graduation signals. 
             Write latest watchlist to inbox."
```

This creates a 1-minute cron that triggers a scan cycle. Within each cycle, the skill polls pump.fun data according to `scanIntervalSeconds` (default 30s), meaning one cron tick can produce 1–2 scan passes depending on response latency.

**Why cron, not a long-running process:** OpenClaw agents are session-based. A long-running polling loop would hold an agent session open indefinitely, consuming context and model tokens. Short cron intervals are the OpenClaw-native way to approximate continuous monitoring while staying within the session lifecycle model.

**Cadence options:**
- `*/1 * * * *` (every 1 min) — near-real-time graduation tracking (recommended for active monitoring)
- `*/5 * * * *` (every 5 min) — balanced for less urgent monitoring
- `*/15 * * * *` (every 15 min) — light monitoring, lower token spend
- `30 * * * *` (every 30 min) — matches heartbeat cadence, minimal cost

Each scan cycle produces:
1. Updated watchlist JSON in `inbox/` (overwritten each cycle, not accumulated)
2. Telegram alert if any token crosses alert thresholds for the first time
3. Graduation event notification when a tracked token actually graduates
4. Feed health status (logged; user notified only if pump.fun API fails)

**Alert deduplication:** Each token only triggers one alert per threshold crossing. The dedup cache is stored in the agent workspace at `memory/pump-fun-monitor-dedup.json` and persists across cron invocations. If WOJAK crosses 0.85 graduation score, you get one alert. You won't get another unless it drops below 0.85 and crosses again, or unless it actually graduates (which is always alerted).

## Requirements

### MCP Servers

**Required:**
```json
{
  "pump-fun-sdk-lite": {
    "command": "node",
    "args": ["vendor/pump-fun-sdk-lite/dist/index.js"]
  }
}
```

pump-fun-sdk-lite provides bonding curve data, graduation events, and trade history. This is the only required dependency.

**Recommended (richer creator analysis):**
```json
{
  "helius": {
    "command": "npx",
    "args": ["-y", "@mcp-dockmaster/mcp-server-helius"],
    "env": { "HELIUS_API_KEY": "${HELIUS_API_KEY}" }
  }
}
```

Helius enables deeper creator wallet analysis — transaction history, token transfer patterns, associated wallets. Without it, creator behavior is limited to what pump-fun-sdk-lite exposes directly.

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Core monitoring via pump-fun-sdk-lite | Yes (no key needed) |
| `HELIUS_API_KEY` | Enhanced creator wallet analysis | Optional |

**This skill works with zero API keys.** pump-fun-sdk-lite doesn't require authentication. Helius adds depth to creator analysis but is not required.

### WrenOS Components (included)

- `vendor/pump-fun-sdk-lite/` — pump.fun bonding curve and trade data
- `packs/meme-discovery-pack/` — pack config (graduation monitor uses the same pack infrastructure; no separate pack needed)

## Feed Health

The skill monitors data source status on each scan cycle.

**Status values:**
- `ok` — responded with valid data
- `degraded` — responded but incomplete or slow
- `error` — failed to respond
- `not_configured` — MCP server not set up

**Primary feed failure (pump-fun-sdk-lite down):**
- Monitoring paused
- User notified in Telegram
- Last watchlist file remains (marked stale)
- Auto-retry on next cron tick

**Enrichment feed failure (Helius down):**
- Monitoring continues
- Creator analysis falls back to pump-fun-sdk-lite native data
- Creator risk flags may be less accurate — noted in output

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Token addresses/symbols logged for debugging (can be disabled)
- Creator wallet addresses logged for monitoring (can be disabled)
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| pump-fun-sdk-lite not installed | Guide user through setup |
| pump-fun API rate limited | Back off, retry next cron tick |
| pump-fun API returns 0 active tokens | Log anomaly, retry next tick |
| Helius 401/403 | Skip enhanced creator analysis, continue with basic |
| Helius rate limited | Skip enhanced creator analysis this cycle |
| Telegram notification fails | Log error, retry next alert, don't block monitoring |
| Stale data (no update in 5+ minutes) | Alert user, continue with last known state |

## Data Retention

- Watchlist file: overwritten each scan cycle (latest state only)
- Graduation event files: 7 days on disk, then rotated
- Alert dedup cache: 24 hours (entries older than 24h are pruned on each cycle)
- Feed health logs: 7 days
- Each scan is stateless (reads from pump.fun API, no persistent signal data beyond dedup cache)
- All files excluded from git

## Relationship to Other Skills

### Upstream: solana-token-discovery
Token discovery can feed graduated tokens into this monitor's scope, and vice versa — tokens discovered by pump-fun-monitor that graduate can be forwarded to solana-token-discovery for post-graduation DEX monitoring. The handoff works through the shared `inbox/` directory.

### Downstream: strategy-builder, risk-manager, trailing-stop
Graduation events in `inbox/` use the graduation-event handoff schema. Any downstream skill that reads this schema can consume the output. In a multi-agent setup, the research agent (running this skill) writes graduation events and the trading agent's strategy evaluation consumes them.

### Parallel: heartbeat-monitor
The heartbeat supervisor agent reads this skill's `feed_health` output during its check cycle. No special integration needed — the supervisor reads the latest `inbox/graduation-monitor-*.json` file and extracts feed status.

## What This Skill Does NOT Do

- **Does not discover tokens broadly.** It watches pump.fun specifically. Use solana-token-discovery for multi-source discovery.
- **Does not trade.** It monitors and alerts. Trading is handled by separate skills.
- **Does not manage risk.** No stops, no sizing, no portfolio awareness.
- **Does not analyze post-graduation performance.** Once graduated, the token leaves this skill's scope and enters solana-token-discovery / strategy-builder territory.
- **Does not require any API keys.** Works out of the box with just pump-fun-sdk-lite.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Upstream:** solana-token-discovery (can feed tokens to monitor)
- **Downstream:** strategy-builder, risk-manager, trailing-stop, or any skill reading the graduation-event handoff schema
- **Heartbeat-aware:** feed_health output readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

The meme-discovery pack includes both solana-token-discovery and pump-fun-monitor. No separate pack installation needed.

### Via ClawHub
```bash
clawhub install pump-fun-monitor
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install `vendor/pump-fun-sdk-lite`
3. Configure `.mcp.json` with pump-fun-sdk-lite MCP server
4. (Optional) Add Helius MCP for enhanced creator analysis
5. Tell your agent: "Start watching pump.fun for graduations"

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

