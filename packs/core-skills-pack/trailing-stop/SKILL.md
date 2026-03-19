---
name: trailing-stop
description: "Dynamic exit management for WrenOS. Implements tiered trailing stops, take-profit ladders, time-based exits, and conditional exit rules for Solana spot/meme token positions. Works within the risk envelope set by risk-manager. The exit execution layer between strategy-builder's rules and actual position closes."
---

# Trailing Stop

Dynamic exit management for your open positions. Moves stop levels as price advances, takes profit in tiers, and enforces time-based exits — so you capture gains without babysitting every position.

## How It Works

When a strategy opens a position, trailing-stop attaches exit rules to it. As the position moves in your favor, stop levels ratchet up to protect gains. Take-profit levels trigger partial sells at defined targets. Time limits force exits if a position hasn't performed within a window.

You define the exit profile. The agent executes it mechanically — no discretion, no emotion, no "let it ride."

**Examples:**
```
"Set a 15% trailing stop on all my positions"
"Take profit in 3 tiers — 25% at +20%, 50% at +40%, rest at +80%"
"Close everything older than 48 hours"
"Tighten the trailing stop to 8% once a position is up 20%"
"Switch WOJAK to a 10% trail with a breakeven floor"
"Show me all active exit rules"
```

## Exit Types

### Percentage Trailing Stop
The classic trailing stop. The stop level moves up as price advances, but never moves down.

```
User: "15% trailing stop"
```

**Behavior:**
- Stop sits 15% below the highest price reached since entry
- If price rises, stop rises with it
- If price falls 15% from the high, position closes
- Stop never moves backward

**Example trajectory:**
```
Entry: $1.00 → stop at $0.85
Peak:  $1.40 → stop at $1.19
Peak:  $1.60 → stop at $1.36
Drop:  $1.35 → TRIGGERED at $1.36 → close
Result: +36% (captured most of +60% move)
```

### Tiered Trailing Stop
The trailing percentage tightens as profit grows — wider room early, tighter protection as gains build.

```
User: "Start with 20% trail, tighten to 12% after +30%, 
       tighten to 8% after +60%"
```

**Behavior:**
- Tier 1: 20% trail until position is +30% from entry
- Tier 2: 12% trail from +30% to +60%
- Tier 3: 8% trail above +60%

This captures the common pattern: give the trade room early when the thesis is being tested, tighten as conviction builds from price confirmation.

### Take-Profit Ladder
Sell in tranches at predefined price targets. Locks in partial gains at each level.

```
User: "Take 25% off at +20%, another 25% at +40%, 
       trail the rest with a 10% stop"
```

**Behavior:**
- At +20%: sell 25% of position
- At +40%: sell another 25% of position
- Remaining 50%: managed by trailing stop

Each take-profit tranche is independent. If price hits +40% without hitting +20% first (gap up), both tranches execute.

### Breakeven Floor
Once a position reaches a configurable profit threshold, the stop moves to breakeven (entry price). Guarantees the trade doesn't turn into a loss.

```
User: "Move stop to breakeven once I'm up 15%"
```

**Behavior:**
- Normal trailing stop until position reaches +15%
- At +15%: stop floor moves to entry price (adjusted for fees)
- Trailing stop continues above breakeven — but can never fall below entry

### Time-Based Exit
Force close after a maximum hold duration, regardless of PnL.

```
User: "Close after 48 hours no matter what"
```

**Behavior:**
- Timer starts at position open
- At 48 hours: position closes at market
- Overrides trailing stop if still active

Can be combined with any other exit type. The time limit is a hard ceiling.

### Conditional Exit
Exit triggers based on external conditions, not just price.

```
User: "Close if volume drops below 50% of entry-hour volume"
"Close if smart money flow reverses"
"Close if narrative score drops below 0.40"
```

**Behavior:**
- Agent monitors the specified condition on each check cycle
- If condition triggers: position closes at market
- Works alongside trailing stops and take-profit levels — whichever triggers first wins

Conditional exits use data from research skills (whale-tracker, crypto-news-scanner, token-deep-dive) to make exit decisions based on thesis invalidation, not just price movement.

### Combined Exit Profile
Multiple exit types can be layered on a single position.

```
User: "15% trailing stop, take 30% off at +25%, breakeven 
       floor at +10%, max hold 72 hours, close if volume 
       dies below 30% of entry volume"
```

All rules are active simultaneously. Whichever triggers first for each portion of the position wins.

## Exit Profile Templates

The agent ships with a few common exit profiles you can start with and customize. These are not strategies — they're exit rule sets.

### Conservative
```
- 20% trailing stop
- Take 50% at +25%
- Breakeven floor at +12%
- Max hold: 72h
```

### Balanced (default)
```
- 15% trailing stop
- Take 30% at +20%, 30% at +40%
- Breakeven floor at +10%
- Max hold: 48h
```

### Aggressive
```
- 10% trailing stop
- No take-profit ladder (let winners run)
- Breakeven floor at +8%
- Max hold: 24h
```

### Scalp
```
- 5% trailing stop
- Take 100% at +10%
- No breakeven floor
- Max hold: 4h
```

You can modify any template or build from scratch.

## Signal Data

### Position Exit State
| Field | Type | Description |
|---|---|---|
| `positionId` | string | Position identifier |
| `token` | string | Token symbol |
| `address` | string | Token mint address |
| `entryPrice` | float | Entry price |
| `currentPrice` | float | Current price |
| `highPrice` | float | Highest price since entry |
| `unrealizedPnlPct` | float | Current unrealized PnL % |
| `trailingStopPrice` | float | Current trailing stop level |
| `trailingStopPct` | float | Current trailing stop percentage |
| `activeTier` | int | Which tier is currently active (for tiered stops) |
| `breakevenActive` | boolean | Whether breakeven floor is engaged |
| `breakevenPrice` | float | Breakeven price (entry + fees) |
| `timeRemaining` | string | Time until time-based exit (null if no time limit) |
| `takeProfitLevels` | array | Remaining take-profit levels with sizes |
| `conditionalExits` | array | Active conditional exit rules and current status |

### Exit Event
| Field | Type | Description |
|---|---|---|
| `exitType` | string | What triggered the exit: "trailing_stop" / "take_profit" / "time_limit" / "breakeven" / "conditional" / "hard_stop" / "kill_switch" |
| `exitPrice` | float | Execution price |
| `exitPnlPct` | float | Realized PnL for this exit tranche |
| `exitSizePct` | float | Percentage of position closed |
| `positionRemaining` | float | Remaining position size (0 if fully closed) |
| `highWaterMark` | float | Highest price reached during hold |
| `holdDuration` | string | How long the position was held |

## Output Format

### Telegram Alert — Stop Triggered

```
🛑 TRAILING STOP — WOJAK (5tN42n...)

Exit: trailing stop at $1.36
Entry: $1.00 → Peak: $1.60 → Exit: $1.36
PnL: +36% ($432)
Hold time: 6h 42m
High water mark: $1.60 (missed +24%)
Tier at exit: 2 (12% trail)
Position: fully closed
```

### Telegram Alert — Take-Profit Hit

```
💰 TAKE PROFIT — WOJAK (5tN42n...)

Sold 30% at $1.40 (+40%)
Realized: $168
Remaining: 40% of position
Active stop: $1.31 (trailing 12% from $1.49 peak)
Next take-profit: none — trailing rest
```

### Telegram Alert — Time Exit

```
⏰ TIME EXIT — BONK (DezX...)

Max hold (48h) reached
Exit at market: $0.0000142
Entry: $0.0000138
PnL: +2.9% ($23)
Position: fully closed
```

### Exit State File

Written to agent workspace, updated each monitoring cycle.

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "trailing-stop-state",
  "activePositions": [
    {
      "positionId": "pos_001",
      "token": "WOJAK",
      "address": "5tN42n...",
      "strategy": "my_momentum_v1",
      "entryPrice": 1.00,
      "currentPrice": 1.42,
      "highPrice": 1.49,
      "unrealizedPnlPct": 42.0,
      "exitProfile": {
        "trailingStopPct": 12,
        "trailingStopPrice": 1.31,
        "activeTier": 2,
        "breakevenActive": true,
        "breakevenPrice": 1.003,
        "timeLimit": "48h",
        "timeRemaining": "18h 22m",
        "takeProfitLevels": [],
        "conditionalExits": [
          { "condition": "volume < 50% of entry volume", "status": "not_triggered" }
        ]
      }
    }
  ],
  "recentExits": [
    {
      "positionId": "pos_000",
      "token": "BONK",
      "exitType": "take_profit",
      "exitPrice": 0.0000152,
      "exitPnlPct": 20.0,
      "exitSizePct": 30,
      "ts": "2026-03-10T06:30:00.000Z"
    }
  ],
  "feed_health": {
    "priceMonitoring": "ok"
  }
}
```

**Output location:** `risk/trailing-stop-state.json` (overwritten each cycle)

### Heartbeat Compatibility

The exit state and `feed_health` block are readable by the heartbeat supervisor agent.

## User Configuration

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `defaultTrailingPct` | 15 | 3 - 30 | Default trailing stop percentage |
| `defaultTimeLimitHours` | 48 | 1 - 168 | Default max hold duration |
| `breakevenThresholdPct` | 10 | 3 - 30 | Profit % needed to activate breakeven floor |
| `exitProfile` | "balanced" | conservative / balanced / aggressive / scalp / custom | Default exit profile for new positions |
| `monitorIntervalSeconds` | 30 | 10 - 300 | How often to check prices against stop levels |
| `slippageBufferBps` | 25 | 10 - 100 | Extra buffer on stop execution to account for slippage |

### Tiered Stop Configuration

```json
{
  "tiers": [
    { "abovePnlPct": 0,  "trailingPct": 20 },
    { "abovePnlPct": 30, "trailingPct": 12 },
    { "abovePnlPct": 60, "trailingPct": 8 }
  ]
}
```

### Take-Profit Ladder Configuration

```json
{
  "takeProfitLevels": [
    { "targetPnlPct": 20, "sellPct": 25 },
    { "targetPnlPct": 40, "sellPct": 25 }
  ],
  "remainderExitRule": "trailing_stop"
}
```

### Example Conversations

**Simple trailing stop:**
```
User: "Set a 15% trailing stop on all positions"
Agent: "Applied 15% trailing stop to 2 open positions.
        WOJAK: stop at $1.21 (current $1.42)
        BONK: stop at $0.0000121 (current $0.0000142)"
```

**Tiered setup:**
```
User: "Start wide at 20%, tighten to 12% once I'm up 25%, 
       then 8% above 50%"
Agent: "Tiered trailing stop configured:
        Tier 1: 20% trail (0% to +25%)
        Tier 2: 12% trail (+25% to +50%)
        Tier 3: 8% trail (above +50%)
        Applied to all new positions."
```

**Take-profit ladder:**
```
User: "Take 25% at +20%, 25% at +40%, trail the rest"
Agent: "Take-profit ladder set:
        +20%: sell 25%
        +40%: sell 25%
        Remaining 50%: 15% trailing stop
        Applied to all new positions."
```

**Adjusting a specific position:**
```
User: "Tighten WOJAK to 8% trail — it's up enough"
Agent: "WOJAK trailing stop tightened to 8%.
        New stop: $1.31 (was $1.21 at 15%)."
```

**Conditional exit:**
```
User: "Close BONK if whale tracker shows distribution"
Agent: "Conditional exit added to BONK:
        Trigger: whale-tracker reports distribution pattern
        Action: close at market
        Active alongside existing 15% trailing stop."
```

**Reviewing active exits:**
```
User: "Show me all active exit rules"
Agent: "Active exit rules:
        
        WOJAK — 8% trail at $1.31, breakeven at $1.00, 
                time limit 18h remaining
        BONK — 15% trail at $0.0000121, conditional 
               (whale distribution), time limit 36h remaining"
```

## Scheduling

Trailing stop monitoring runs on a short-interval cron, same pattern as pump-fun-monitor:

```bash
openclaw cron create --name "trailing-stop-monitor" \
  --expression "*/1 * * * *" \
  --mandate "Run trailing-stop monitoring cycle. Check all open 
             positions against stop levels, take-profit targets, 
             time limits, and conditional exits. Execute closes 
             as needed. Update state file."
```

Each monitoring cycle:
1. Fetches current prices for all open positions
2. Updates high water marks
3. Checks trailing stops, take-profit levels, time limits, and conditionals
4. Executes closes for any triggered exits
5. Sends Telegram alerts for exits
6. Updates `trailing-stop-state.json`

**Why 1-minute cron:** Meme tokens move fast. A 15-minute check interval means your 15% trailing stop could blow through to -25% before the agent notices. The 1-minute cron keeps exit execution tight.

## Interaction with Risk Manager

Trailing-stop and risk-manager work together but have distinct roles:

| Concern | Risk Manager | Trailing Stop |
|---|---|---|
| Hard stop loss | ✅ Enforces absolute max loss | ❌ |
| Trailing stop | ❌ | ✅ Dynamic ratcheting stop |
| Take-profit | ❌ | ✅ Partial sells at targets |
| Time-based exit | ❌ | ✅ Max hold duration |
| Conditional exit | ❌ | ✅ Thesis-invalidation exits |
| Drawdown pause | ✅ Strategy/portfolio DD | ❌ |
| Position sizing | ✅ Pre-trade gate | ❌ |
| Exposure limits | ✅ Portfolio-level caps | ❌ |
| Kill switch | ✅ Emergency stop | ❌ |

**Execution priority:** Risk manager's hard stop takes precedence over trailing stop. If hard stop is -12% and trailing stop is at -10%, the trailing stop fires first. If trailing stop somehow misses (gap down), hard stop catches it.

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

agenti-lite provides real-time price data for stop monitoring. No API key required.

**Optional (for conditional exits):**
Research skill MCP servers (crypto-news-lite, Helius, etc.) if you use conditional exits based on research data (whale distribution, narrative decay, etc.).

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Price monitoring via agenti-lite | Yes (no key needed) |

**This skill works with zero API keys.**

### WrenOS Components (included)

- `vendor/agenti-lite/` — real-time price data (universal-crypto-mcp)

## Privacy

- No prompt or completion content is logged
- Exit rules and position state stored locally in agent workspace only
- No wallet private keys accessed — trailing-stop reads prices and triggers close signals
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| Price feed unavailable | Hold all positions, alert operator, retry next cycle |
| Price gap (stop blown through) | Execute at market, log gap, report actual vs expected exit |
| Conditional exit data source down | Fall back to price-based exits only, alert operator |
| Multiple exits trigger simultaneously | Execute in priority order: hard_stop > trailing_stop > take_profit > time_limit > conditional |
| Position already closed externally | Detect, clean up state, log |

## Data Retention

- `trailing-stop-state.json`: overwritten each monitoring cycle
- Exit event logs: 30 days, then rotated
- All exit files excluded from git by default

## Relationship to Other Skills

### Upstream: strategy-builder
Strategy builder defines when to enter. Trailing stop manages exits mechanically based on the configured exit profile.

### Parallel: risk-manager
Risk manager sets the hard envelope (max loss, drawdown pauses). Trailing stop operates within that envelope with dynamic exits.

### Downstream: portfolio-optimizer
Exit performance data feeds portfolio optimization — which exit profiles preserve the most edge for which strategy types.

### Data sources: Category 1 Research Skills
Conditional exits can reference data from whale-tracker, crypto-news-scanner, token-deep-dive, etc.

## What This Skill Does NOT Do

- **Does not decide when to enter.** That's strategy-builder's job.
- **Does not enforce portfolio-level risk.** That's risk-manager's job. Trailing stop handles per-position exit mechanics.
- **Does not execute trades directly.** It triggers close signals. Execution is handled by the agent's trading infrastructure.
- **Does not require any API keys.** Works with agenti-lite's free price data.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Upstream:** strategy-builder (attaches exit profiles to new positions)
- **Parallel:** risk-manager (hard envelope around trailing stop behavior)
- **Heartbeat-aware:** exit state readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install trailing-stop
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install `vendor/agenti-lite`
3. Configure `.mcp.json`
4. Tell your agent: "Set a 15% trailing stop on all positions"

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

