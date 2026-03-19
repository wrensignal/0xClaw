---
name: strategy-builder
description: "Core backtesting and strategy evaluation framework for WrenOS. Converts natural language strategy descriptions into testable entry/exit rules, backtests against historical Solana token data, evaluates via walk-forward stability gates, and ranks strategies in a competitive zoo with champion/challenger dynamics. The engine that all other trading skills plug into. Paper-first by default."
---

# Strategy Builder

The backtesting and strategy evaluation engine for WrenOS. You describe a trading strategy in natural language. The agent converts it into testable rules, backtests it against historical data, evaluates it through stability gates, and ranks it against your other strategies in a competitive zoo. Paper-first. Evidence-first.

## How It Works

You tell your agent what kind of trades you want to make — entry conditions, exit conditions, sizing approach, or just a high-level thesis. The agent translates that into a structured strategy definition, runs it against historical Solana token data, computes performance metrics, applies stability gates, and tells you whether the strategy has edge.

No strategy goes live without passing gates. That is not a configuration option — it is the design.

**Examples:**
```
"Build a strategy that buys when 3+ large wallets accumulate 
 and sells on a 15% trailing stop"
"Backtest a momentum play — enter on 1h volume spike above 
 3x average, exit on velocity decay below 1x"
"Test a graduation play — buy at 85%+ pump.fun curve with 
 accelerating buys, sell 30 minutes after graduation"
"What if I held every token above 0.80 composite from 
 discovery for 24 hours?"
"Compare my strategy A vs strategy B over the last 30 days"
"Optimize entry threshold — test 0.70, 0.75, 0.80, 0.85"
```

## Core Concepts

### Strategy Definition
Every strategy is a structured set of rules:

| Component | Description | Example |
|---|---|---|
| **Entry signal** | What triggers a buy | "Volume spikes 3x above 24h average" |
| **Entry confirmation** | Additional conditions to validate entry | "Liquidity above $100k, buy/sell ratio > 1.5" |
| **Position sizing** | How much to allocate | "2% of portfolio per trade" |
| **Exit — take profit** | When to lock in gains | "Sell 50% at +30%, rest on trailing stop" |
| **Exit — stop loss** | When to cut losses | "Hard stop at -12%" |
| **Exit — trailing stop** | Dynamic profit protection | "15% trailing stop from peak" |
| **Exit — time-based** | Maximum hold duration | "Close after 48 hours regardless" |
| **Filters** | Conditions that must persist | "Only Solana tokens, liquidity floor $50k" |

The agent converts natural language into this structure. You can describe your strategy at any level of specificity — from a vague thesis ("I want to follow whale wallets") to precise rules ("buy when netflow ratio > 2.0 from 3+ wallets within 4 hours, trailing stop 15%, max hold 48h").

### Signal Sources for Entry Rules

Strategies can use any data available from your configured research skills as entry signals:

- **Wallet activity** — whale accumulation, distribution patterns, exchange flows (from whale-tracker)
- **Price/volume momentum** — volume spikes, price acceleration, buy/sell ratios (from agenti-lite DEX data)
- **Graduation events** — pump.fun curve progress, buy velocity, creator behavior (from pump-fun-monitor)
- **Narrative signals** — mention velocity, sentiment shifts, trending topics (from crypto-news-scanner)
- **Holder patterns** — concentration changes, distribution trends, growth rates (from token-deep-dive)
- **Composite scores** — multi-signal scores from discovery or deep dive output (from solana-token-discovery)

You're not limited to these — any quantifiable condition can become an entry or exit rule. The agent will tell you if the data source needed for a rule is available or needs to be configured.

### Backtesting

Strategies are evaluated against historical data. The backtest engine:

1. Replays historical token data through entry/exit rules
2. Simulates execution with realistic slippage and fee estimates
3. Tracks per-trade PnL, drawdowns, and timing
4. Computes aggregate metrics over the backtest window

**Data sources for backtesting:**
- Historical DEX analytics via agenti-lite (price, volume, liquidity over time)
- Historical market data via agenti-lite (CoinGecko time series)
- Historical news/sentiment via crypto-news-lite (for narrative-based strategies)
- Historical on-chain data via Helius (holder changes, wallet flows — if configured)

### Walk-Forward Stability Gates

A strategy must pass stability gates before it is considered viable. Gates prevent overfitting to a single historical window.

**Gate process:**
1. **In-sample window** — backtest on the primary historical window (e.g., last 14 days)
2. **Out-of-sample window** — backtest on a held-out window the strategy hasn't seen (e.g., next 7 days)
3. **Consistency check** — do in-sample and out-of-sample metrics agree within tolerance?
4. **Multi-window validation** — repeat across 2-3 different time windows

**Gate pass criteria (defaults):**
- Average edge in basis points (`avgEdgeBps`) > 0 after estimated gas + slippage
- Worst drawdown (`worstDrawdownPct`) within configured max (default: 20%)
- Minimum trade count (`totalTrades`) >= 10 across backtest windows
- Out-of-sample edge >= 50% of in-sample edge (consistency check)

A strategy that fails gates is not promoted. This is fail-closed — if edge <= 0 after costs, the strategy is rejected regardless of how good the in-sample numbers look.

### Strategy Zoo

All your strategies compete in a zoo with champion/challenger dynamics:

- **Champion** — your current best-performing strategy (tracked in `current-champion.json`)
- **Challengers** — new or modified strategies competing for champion status (tracked in `challenger-board.json`)
- **Leaderboard** — ranked performance across all your active strategies (`zoo-leaderboard.json`)
- **Archived** — strategies that failed gates or were superseded (moved to `archived/`)

New strategies enter as challengers. If a challenger outperforms the champion over a full evaluation cycle and passes all gates, it becomes the new champion.

The zoo starts empty — you build it by creating and testing strategies. Over time, the zoo becomes your personalized strategy library, refined by evidence.

### Market Calibration

The zoo maintains a `market-calibration.json` that tracks:
- Current market regime (trending / ranging / volatile / low-activity)
- Regime-specific performance adjustments
- Parameter sensitivity across strategies
- Which of your strategies perform best in which regimes

This prevents blind strategy selection — the agent considers the current market environment when ranking strategies.

## Building Your First Strategy

### Step 1: Describe what you want to trade

Start with a thesis. The agent will help you formalize it.

```
User: "I want to buy tokens that have strong whale accumulation 
       and sell when momentum fades"
Agent: "I'll structure that as:
        Entry: 3+ large wallets net-buying within 24h
        Confirmation: Liquidity > $50k, buy/sell ratio > 1.5
        Exit: Trailing stop 15% from peak
        Exit: Hard stop -12%
        Exit: Time limit 48h
        Sizing: 2% of portfolio per trade
        
        Want to adjust anything before I backtest?"
```

### Step 2: Backtest

```
User: "Run it"
Agent: "Running 14-day backtest with 7-day out-of-sample...
        
        Result: +$920 (+12.1%), 82 bps edge, 34 trades
        Win rate: 59% | Max DD: 14.8%
        Gate: ✅ PASSED (consistency 68%)
        Added to zoo as challenger."
```

### Step 3: Iterate

```
User: "What if I tighten the trailing stop to 10%?"
Agent: "Running variant...
        
        10% trail: 64 bps edge, 11.2% DD (tighter stop = 
        less profit captured but lower drawdown)
        
        Original 15% trail was better on edge (82 vs 64 bps).
        Tradeoff: -22% edge for -24% drawdown. Your call."
```

### Step 4: Compare

```
User: "Compare it against my other strategies"
Agent: "Zoo leaderboard:
        #1 your_momentum_v1 — 105 bps, 63% WR, 12.1% DD
        #2 your_whale_trail_v0 — 82 bps, 59% WR, 14.8% DD
        #3 your_grad_play_v0 — 61 bps, 55% WR, 9.4% DD"
```

### Step 5: Optimize

```
User: "Sweep the entry threshold — test requiring 2, 3, 4, 
       and 5 wallets"
Agent: "Running 4 parameter variants...
        
        2 wallets: 58 bps (too loose — noisy entries)
        3 wallets: 82 bps ← current, best edge
        4 wallets: 74 bps (fewer trades, similar quality)
        5 wallets: 45 bps (too restrictive — misses setups)
        
        Optimal: 3 wallets. No change recommended."
```

## Backtest Output

Every backtest produces a structured scorecard:

### Performance Metrics
| Metric | Description |
|---|---|
| `totalPnlUsd` | Total profit/loss in USD |
| `totalPnlPct` | Total return as percentage |
| `avgEdgeBps` | Average edge per trade in basis points (after costs) |
| `totalTrades` | Number of completed trades |
| `winRate` | Percentage of trades with positive PnL |
| `avgWinPct` | Average winning trade return |
| `avgLossPct` | Average losing trade return |
| `profitFactor` | Gross profit / gross loss |
| `sharpeRatio` | Risk-adjusted return |

### Risk Metrics
| Metric | Description |
|---|---|
| `worstDrawdownPct` | Maximum peak-to-trough drawdown |
| `maxDrawdownDuration` | Longest drawdown recovery period |
| `avgDrawdownPct` | Mean drawdown across all drawdown periods |
| `maxConsecutiveLosses` | Longest losing streak |
| `valueAtRisk95` | 95th percentile worst-case trade |

### Gate Results
| Metric | Description |
|---|---|
| `gatePass` | true/false — did the strategy pass all gates? |
| `inSampleEdgeBps` | Edge on the in-sample window |
| `outOfSampleEdgeBps` | Edge on the out-of-sample window |
| `consistencyRatio` | Out-of-sample / in-sample edge ratio |
| `windowsTestedCount` | Number of backtest windows evaluated |
| `failReasons` | Array of reasons if gate failed (empty if passed) |

### Output File Format

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "strategy-backtest",
  "strategy": {
    "name": "my_whale_trail_v0",
    "description": "Buy on multi-wallet accumulation, exit on trailing stop",
    "version": "v0"
  },
  "backtest": {
    "window": { "start": "2026-02-24", "end": "2026-03-10" },
    "performance": {
      "totalPnlUsd": 920,
      "totalPnlPct": 12.1,
      "avgEdgeBps": 82,
      "totalTrades": 34,
      "winRate": 0.59,
      "avgWinPct": 7.8,
      "avgLossPct": -4.2,
      "profitFactor": 1.85,
      "sharpeRatio": 1.22
    },
    "risk": {
      "worstDrawdownPct": 14.8,
      "maxDrawdownDuration": "2d 8h",
      "avgDrawdownPct": 5.1,
      "maxConsecutiveLosses": 3,
      "valueAtRisk95": -5.8
    },
    "gates": {
      "gatePass": true,
      "inSampleEdgeBps": 96,
      "outOfSampleEdgeBps": 65,
      "consistencyRatio": 0.68,
      "windowsTestedCount": 3,
      "failReasons": []
    }
  },
  "zoo": {
    "rank": 2,
    "isChampion": false,
    "championName": "my_momentum_v1",
    "challengerStatus": "qualifying"
  },
  "feed_health": {
    "historicalDex": "ok",
    "historicalMarket": "ok",
    "helius": "not_configured"
  }
}
```

**Output location:** `strategies/{strategy_name}/backtest-{timestamp}.json`

**Zoo state files:**
- `strategies/current-champion.json`
- `strategies/zoo-leaderboard.json`
- `strategies/challenger-board.json`
- `strategies/market-calibration.json`

## Telegram Reports

### Backtest Result

```
📊 BACKTEST — my_whale_trail_v0

PnL: +$920 (+12.1%)
Edge: 82 bps avg (after costs)
Trades: 34 | Win rate: 59%
Sharpe: 1.22 | Profit factor: 1.85
Max DD: 14.8% | Worst streak: 3 losses

Gate: ✅ PASSED
  In-sample: 96 bps | Out-of-sample: 65 bps
  Consistency: 68% | Windows: 3

Zoo rank: #2 (challenger to my_momentum_v1)
```

### Zoo Leaderboard

```
🏆 STRATEGY ZOO — Leaderboard

👑 #1 my_momentum_v1 — 105 bps, 63% WR, 12.1% DD
   #2 my_whale_trail_v0 — 82 bps, 59% WR, 14.8% DD
   #3 my_grad_play_v0 — 61 bps, 55% WR, 9.4% DD

Market regime: trending
Calibration: momentum-type strategies favored
```

### Comparison

```
📊 COMPARISON — strategy A vs strategy B

                  Strategy A     Strategy B
Edge (bps):       82             105
Win Rate:         59%            63%
Trades:           34             48
Max DD:           14.8%          12.1%
Sharpe:           1.22           1.45
Gate:             ✅ pass        ✅ pass

Verdict: Strategy B has better edge and risk profile.
         Strategy A trades less frequently but has 
         comparable risk-adjusted returns.
```

## User Configuration

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `backtestWindowDays` | 14 | 7 - 90 | Primary backtest window |
| `outOfSampleDays` | 7 | 3 - 30 | Out-of-sample validation window |
| `multiWindowCount` | 3 | 2 - 5 | Number of windows for walk-forward validation |
| `minEdgeBps` | 0 | -50 - 500 | Minimum edge after costs to pass gate |
| `maxDrawdownPct` | 20 | 5 - 50 | Maximum allowed drawdown |
| `minTrades` | 10 | 5 - 100 | Minimum trade count for statistical validity |
| `consistencyMinRatio` | 0.50 | 0.25 - 0.90 | Min out-of-sample/in-sample edge ratio |
| `slippageEstimateBps` | 50 | 10 - 200 | Slippage assumption per trade |
| `feeEstimateBps` | 30 | 5 - 100 | Fee assumption per trade (Solana tx fees + DEX fees) |
| `defaultPositionSizePct` | 2 | 0.5 - 10 | Default per-trade allocation as % of portfolio |
| `maxConcurrentPositions` | 3 | 1 - 10 | Maximum simultaneous open positions |
| `zooMaxStrategies` | 10 | 3 - 20 | Maximum active strategies in the zoo |
| `autoArchiveBelow` | -50 | bps | Auto-archive strategies below this edge |

### More Example Conversations

**Failure case:**
```
User: "Test a strategy that buys any token over $1M volume"
Agent: "Running backtest...
        
        Result: -$340 (-4.4%), -28 bps edge, 89 trades
        Gate: ❌ FAILED
        Reason: Negative edge after costs (-28 bps). 
        No entry confirmation = too many low-quality entries.
        
        Suggestion: Add a confirmation signal (whale activity, 
        narrative, or holder distribution) to filter entries."
```

**Parameter sweep:**
```
User: "Optimize the trailing stop — test 10%, 12%, 15%, 18%, 20%"
Agent: "Running 5 parameter variants...
        
        10% trail: 64 bps, 11.2% DD
        12% trail: 78 bps, 13.0% DD
        15% trail: 82 bps, 14.8% DD ← best edge
        18% trail: 75 bps, 16.4% DD
        20% trail: 68 bps, 18.1% DD
        
        Optimal: 15% trailing stop. All variants pass gates."
```

**Market regime awareness:**
```
User: "Which of my strategies works best in a ranging market?"
Agent: "Based on market calibration data:
        In ranging regimes, your mean-reversion strategies 
        outperform momentum by ~40 bps. Current regime: 
        ranging. Consider shifting allocation."
```

## Scheduling

Strategy backtests are typically on-demand. For ongoing zoo maintenance, schedule a nightly review:

```bash
openclaw cron create --name "strategy-nightly-review" \
  --expression "0 2 * * *" \
  --mandate "Run strategy-builder nightly review. Re-backtest all 
             active zoo strategies on latest data. Update leaderboard. 
             Promote/demote challengers. Archive failed strategies. 
             Update market calibration. Report changes to Telegram."
```

Each nightly review produces:
1. Updated backtest scorecards for all active strategies
2. Updated zoo leaderboard and champion/challenger status
3. Updated market calibration
4. Telegram summary of changes (new champion, archived strategies, regime shift)

## Requirements

### MCP Servers

**Required (minimum viable backtesting):**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  }
}
```

agenti-lite provides historical DEX analytics and market data for backtesting. No API key required.

**Recommended (richer historical data):**
```json
{
  "crypto-news-lite": {
    "command": "node",
    "args": ["vendor/crypto-news-lite/mcp/index.js"]
  },
  "helius": {
    "command": "npx",
    "args": ["-y", "@mcp-dockmaster/mcp-server-helius"],
    "env": { "HELIUS_API_KEY": "${HELIUS_API_KEY}" }
  }
}
```

crypto-news-lite adds historical news/sentiment data for narrative-based strategies. Helius adds historical on-chain holder data for holder-based strategies. Both are optional.

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Historical DEX + market data via agenti-lite | Yes (no key needed) |
| `HELIUS_API_KEY` | Historical on-chain data for holder-based strategies | Optional |

**Minimum setup:** agenti-lite alone provides enough historical data to backtest price/volume/momentum-based strategies. Helius adds depth for on-chain strategies.

### WrenOS Components (included)

- `vendor/agenti-lite/` — historical DEX analytics, market data (universal-crypto-mcp)
- `vendor/crypto-news-lite/` — historical news and sentiment (free-crypto-news)
- `packs/meme-discovery-pack/` — pack config and handoff schema

### Upstream Skill Data

The strategy builder can consume output from research skills as entry signals:
- **solana-token-discovery** — watchlist candidates
- **pump-fun-monitor** — graduation events
- **token-deep-dive** — composite scores and red flags
- **whale-tracker** — accumulation/distribution patterns
- **crypto-news-scanner** — narrative signals

These are not required — strategies can be backtested on historical data alone. But in live operation, research skill output feeds the entry signals.

## Paper / Live Separation

**Paper mode (default):** All strategies run in paper mode. Backtests use historical data. No real trades. No wallet interaction.

**Live promotion requires:**
1. Strategy passes all walk-forward stability gates
2. Complete backtest scorecard artifacts exist
3. Explicit operator approval for live mode
4. Risk policy configured (see risk-manager skill)

**Fail-closed rule:** If expected edge <= 0 after gas + slippage estimate, the strategy is rejected and cannot be promoted to live. This is non-negotiable.

## Feed Health

| Source | Used for | Required |
|---|---|---|
| agenti-lite (historical DEX) | Price/volume/liquidity backtesting | Yes |
| agenti-lite (market data) | Market regime calibration | Yes |
| crypto-news-lite (historical) | Narrative-based strategy backtesting | Optional |
| Helius (historical on-chain) | Holder-based strategy backtesting | Optional |

The `feed_health` block in backtest output is readable by the heartbeat supervisor agent.

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Strategy definitions stored locally in agent workspace only
- Backtest results stored locally (excluded from git by default)
- Inference routes through Speakeasy when configured
- No wallet interaction in paper mode

## Error Handling

| Error | Action |
|---|---|
| Insufficient historical data | Report minimum data requirement, suggest shorter window |
| agenti-lite historical module error | Abort backtest, notify user |
| Strategy definition ambiguous | Ask user for clarification on entry/exit rules |
| Zero trades in backtest | Report that no entries triggered — suggest loosening filters |
| Gate failure | Report specific failure reasons and suggest improvements |
| Zoo full (max strategies) | Suggest archiving lowest-ranked strategy |

## Data Retention

- Strategy definitions: persistent (in `strategies/{name}/`)
- Backtest scorecards: 30 days, then rotated
- Zoo state files: persistent (champion, leaderboard, calibration)
- Archived strategies: persistent until manually deleted
- All strategy files excluded from git by default

## Relationship to Other Skills

### Upstream: all Category 1 Research Skills
Research skills feed entry signals. Strategy builder evaluates whether those signals have tradable edge.

### Downstream: risk-manager, trailing-stop, portfolio-optimizer
Strategy builder defines what to trade and when. Risk manager enforces how much and when to stop. Trailing stop handles dynamic exit mechanics. Portfolio optimizer tunes allocation across strategies.

### Parallel: heartbeat-monitor
Heartbeat supervisor reads strategy zoo health during check cycles.

## What This Skill Does NOT Do

- **Does not execute trades.** It evaluates strategies. Execution is handled by the agent's trading infrastructure (wallet, DEX interaction).
- **Does not manage risk.** It backtests risk metrics but does not enforce live risk controls. Use risk-manager for that.
- **Does not discover tokens.** It evaluates strategies that consume research skill output. Use Category 1 skills for discovery.
- **Does not ship pre-built strategies.** It is a framework for building and testing your own. You define the rules, the engine evaluates them.
- **Does not require any API keys.** Works with agenti-lite's free historical data out of the box.
- **Does not promote to live automatically.** Live mode requires explicit operator approval. Always.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Upstream:** all Category 1 Research Skills (entry signal sources)
- **Downstream:** risk-manager, trailing-stop, portfolio-optimizer
- **Heartbeat-aware:** feed_health + zoo state readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

The meme-discovery pack includes all research skills and strategy-builder.

### Via ClawHub
```bash
clawhub install strategy-builder
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install at minimum `vendor/agenti-lite`
3. Configure `.mcp.json` with MCP servers
4. Tell your agent: "Build a strategy and backtest it"

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

