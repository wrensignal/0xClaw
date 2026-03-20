---
name: solana-token-discovery
description: "Multi-path Solana token discovery engine for WrenOS. Runs independent candidate pipelines — smart money flow, volume/momentum, pump.fun graduation, and narrative — each producing tagged candidates that flow into a shared evaluation pipeline. Users enable the paths they want, and the agent runs them independently on staggered cadences. Tokens appearing from multiple paths get a convergence bonus. Outputs the WrenOS meme-watchlist handoff format with per-candidate source tagging for downstream performance tracking."
---

# Solana Token Discovery

Multi-path discovery engine that finds, scores, and ranks Solana tokens from independent signal pipelines. You choose which paths to run — the agent operates them in parallel and delivers a unified, ranked watchlist.

## How It Works

You tell your agent what kind of tokens you're looking for. The agent activates the right discovery paths, runs them independently, merges and deduplicates the results, scores candidates, and delivers a ranked watchlist to Telegram.

Each discovery path is an independent pipeline with its own primary signal source, cadence, and candidate output. Paths do not depend on each other. A failure in one path does not block the others.

Tokens discovered by multiple paths simultaneously receive a convergence bonus — the more independent signals pointing at the same token, the higher its score.

**Examples:**
```
"Find Solana tokens where whales are accumulating and liquidity is above $200k"
"Alert me when a token is about to graduate from pump.fun with strong buy pressure"
"What tokens are trending on crypto Twitter right now?"
"Show me tokens with volume spikes in the last hour"
"Run all discovery paths and show me what converges"
"Research WOJAK — give me the full picture"
```

## Discovery Paths

Each path is an independent candidate pipeline. Enable the ones you want. The agent runs them on staggered cadences and merges the output.

### Smart Money Path (`sm`)
**What it finds:** Tokens that large, high-PnL wallets are accumulating.
**Primary signal:** Net inflow/outflow, number of distinct smart wallets, inflow concentration, netflow ratio.
**Provided by:** Wallet analytics via agenti-lite MCP (no API key needed)
**Default cadence:** Every 30 minutes
**Best for:** Continuation trades, following proven wallets, accumulation detection.

This is the default path and matches the behavior of previous single-pipeline discovery. Enabling only this path is equivalent to the original discovery behavior.

### Volume/Momentum Path (`vol`)
**What it finds:** Tokens with sudden trading activity spikes — volume surges, liquidity inflows, buy/sell ratio shifts.
**Primary signal:** DEX volume change vs trailing average, buy/sell ratio, liquidity growth rate.
**Provided by:** DEX analytics via agenti-lite MCP (no API key needed)
**Default cadence:** Every 30 minutes
**Best for:** Catching volume-led moves before smart money shows up, momentum entry, breakout detection.

This path discovers tokens that the smart money path misses — volume can spike before whale wallets are visible in the data.

### Graduation Path (`grad`)
**What it finds:** Tokens approaching or completing pump.fun graduation with accelerating buy pressure.
**Primary signal:** Bonding curve completion %, buy velocity/acceleration, unique buyer count, creator wallet behavior.
**Provided by:** pump-fun-sdk-lite MCP (no API key needed)
**Default cadence:** Every 15 minutes (graduation events are time-sensitive)
**Best for:** Pre-graduation event trades, early-stage discovery, graduation momentum plays.

This path discovers tokens that have zero smart money signal by definition — whales don't buy tokens still on a bonding curve. The shorter cadence reflects the time-sensitivity of graduation events.

### Narrative Path (`narr`)
**What it finds:** Tokens riding a social or news narrative wave — mention velocity spikes, trending topics, sentiment shifts.
**Primary signal:** News mention velocity, social engagement metrics, narrative theme classification, AI sentiment analysis.
**Provided by:** crypto-news-lite MCP (no API key needed), optionally enriched by LunarCrush
**Default cadence:** Every 60 minutes
**Best for:** Narrative-first discovery, catalyst identification, attention-based screening before price moves.

This path finds tokens where the story is building before the chart confirms. Longer cadence because narratives evolve slower than volume or graduation events.

### On-Chain Anomaly Path (`chain`) — optional
**What it finds:** Tokens with unusual holder distribution shifts, large transfer patterns, or concentration changes.
**Primary signal:** Adjusted top-5 holder share change, holder count growth, large transfer events.
**Provided by:** Helius MCP
**Default cadence:** Every 30 minutes
**Best for:** Distribution pattern detection, organic adoption signals, early whale concentration warnings.
**Requires:** `HELIUS_API_KEY`

## Signal Sources

Each discovery path has a primary signal source. All paths can optionally enrich candidates with data from other sources.

| Source | Provides | Required By | API Key |
|---|---|---|---|
| agenti-lite (wallet analytics) | Smart money flow, wallet behavior | `sm` path | None |
| agenti-lite (DEX analytics) | Volume, liquidity, buy/sell ratios | `vol` path, tradability gate | None |
| pump-fun-sdk-lite | Bonding curve, graduation events | `grad` path | None |
| crypto-news-lite | News mentions, sentiment, narratives | `narr` path | None |
| Helius | Holder distribution, on-chain transfers | `chain` path | `HELIUS_API_KEY` |
| LunarCrush | Social sentiment, galaxy score | Enrichment only | `LUNARCRUSH_API_KEY` |
| Birdeye | Trade volume confirmation, execution quality | Enrichment only | `BIRDEYE_API_KEY` |

**The more sources you configure, the richer enrichment becomes.** But the core paths (sm, vol, grad, narr) work with zero API keys.

## Cross-Path Enrichment

After each path produces its raw candidates, an optional enrichment pass adds context from other available sources. Enrichment is informational — it adds signal dimensions but never filters out candidates.

A `vol` candidate gets enriched with: is smart money also present? Is there a narrative? How does holder distribution look?
A `grad` candidate gets enriched with: creator behavior, buyer breadth, any narrative support.
An `sm` candidate gets enriched with: narrative context, holder distribution.

Enrichment is best-effort and cached. If an enrichment source fails or times out, the candidate proceeds without it. Enrichment data from the previous cycle is reused if less than 30 minutes old.

## Convergence Scoring

Tokens discovered by multiple independent paths in the same cycle receive a convergence bonus to their composite score:

| Independent Paths | Bonus |
|---|---|
| 2 paths | +0.05 |
| 3 paths | +0.10 |
| 4+ paths | +0.15 |

A token appearing in both the smart money watchlist AND the volume watchlist is a stronger candidate than one appearing in either alone. Convergence is a powerful signal because it means multiple independent data sources are pointing at the same token.

## Deduplication

A token may appear from multiple paths in the same cycle. Dedup rules:
- Token keyed by `solana:{mint_address}` (same as all WrenOS token identity)
- If the same token appears from multiple paths, signals are merged and all source paths are tracked
- The `candidateSource` field becomes an array of all contributing paths
- Convergence bonus is applied based on the number of independent paths

## Filters & Gates

The discovery pipeline applies configurable filters to ensure output quality. All thresholds are user-adjustable. These apply to ALL paths universally.

### Tradability Gate (always active)
Every token must pass basic tradability checks before it can appear in the watchlist:

| Check | Default | Configurable | Purpose |
|---|---|---|---|
| Chain | solana | No (v1) | WrenOS v1 is Solana-only |
| Liquidity | >= $50,000 | Yes | Position can be entered/exited |
| 24h Volume | >= $120,000 | Yes | Real trading activity exists |
| Pair Age | >= 1 hour | Yes | Avoid untested pairs |

### Buy/Sell Confirmation (enabled by default)
```
buys1h > sells1h AND buys24h > sells24h
```
Filters out tokens where selling pressure dominates. Can be disabled for contrarian strategies.

### Smart Money Quality (enabled when SM path active)
| Condition | Effect | Reason |
|---|---|---|
| Fewer than 3 smart wallets | SM score halved | Single-wallet distortion risk |
| Top-decile inflow concentration | SM score reduced 30% | Concentrated flow is less reliable |

### Creator Behavior (enabled by default)
Tokens where the creator/deployer is aggressively selling are flagged or excluded:
| Condition | Effect |
|---|---|
| Creator net sell > $50k in 24h | Excluded from watchlist |
| Creator net sell > $10k in 2h | Flagged as caution |

### Execution Quality (optional)
| Check | Default | Purpose |
|---|---|---|
| Slippage at target size | <= 500 bps | Can the trade execute cleanly |

## Composite Scoring

Active sources contribute to a composite score (0 to 1). If a source is disabled or unavailable, its weight is redistributed proportionally across active sources.

**Default weights:**

| Signal | Weight | Source |
|---|---|---|
| Smart Money | 34% | Wallet analytics via agenti-lite |
| Momentum | 20% | DEX analytics via agenti-lite |
| Liquidity | 19% | DEX analytics via agenti-lite |
| Social | 15% | LunarCrush |
| Narrative | 5% | crypto-news-lite |
| Pump Progress | 5% | pump-fun-sdk-lite |
| Novelty | 2% | Watchlist persistence |

**Weight redistribution:** If LunarCrush is not configured, the 15% social weight redistributes proportionally across active signals.

Users can set custom weights:
```
"Weight smart money at 50% and drop social to 5%"
```

## Identity Resolution

Every token is keyed by `chain:address`, not symbol. This prevents collisions when multiple tokens share the same ticker.

```
canonical key: solana:{mint_address}
display: {symbol} ({mint_address_short})
```

## Output Format

The watchlist follows the WrenOS meme-watchlist handoff schema:

```json
{
  "ts": "2026-03-12T08:00:00.000Z",
  "type": "meme-discovery",
  "pathsRun": ["sm", "vol", "grad"],
  "watchlist": [
    {
      "rank": 1,
      "symbol": "WOJAK",
      "address": "5tN42n9vM...",
      "chain": "solana",
      "candidateSource": ["sm", "vol"],
      "convergenceBonus": 0.05,
      "compositeScore": 0.87,
      "signals": {
        "smartMoney": { "score": 0.91, "nofTraders": 7, "netflowRatio": 2.3 },
        "momentum": { "score": 0.82, "volumeChangeVsAvg": 3.1 },
        "liquidity": { "score": 0.88, "liquidityUsd": 350000 },
        "social": { "score": 0.6, "source": "lunarcrush" },
        "narrative": { "score": 0.55, "mentionCount": 12 },
        "pump": { "score": null, "isGraduated": true }
      },
      "evidence": "7 SM wallets + 3.1x volume spike. Convergence: sm + vol.",
      "invalidation": "SM netflow reversal or volume drop below 1.5x avg",
      "confidenceTier": "high"
    }
  ],
  "universe_stats": {
    "candidatesScanned": { "sm": 50, "vol": 40, "grad": 15 },
    "tradabilityPassed": { "sm": 25, "vol": 18, "grad": 6 },
    "merged": 42,
    "finalRanked": 8
  },
  "feed_health": {
    "walletAnalytics": "ok",
    "dexAnalytics": "ok",
    "pumpFun": "ok",
    "cryptoNews": "ok",
    "birdeye": "ok",
    "lunarcrush": "not_configured",
    "helius": "ok"
  },
  "config": {
    "activePaths": ["sm", "vol", "grad"],
    "minLiquidityUsd": 50000,
    "watchlistSize": 8,
    "weights": { "smartMoney": 0.40, "momentum": 0.23, "liquidity": 0.22, "narrative": 0.06, "pump": 0.06, "novelty": 0.03 }
  }
}
```

**Output location:** `inbox/meme-watchlist-{timestamp}.json`

The `candidateSource` field persists through the entire downstream pipeline — into strategy evaluation, backtesting, and trade outcomes. This enables per-path performance tracking in the strategy zoo.

## User Configuration

All parameters are configurable through Telegram conversation.

### Path Configuration

| Parameter | Default | Options | Description |
|---|---|---|---|
| `paths.smart_money.enabled` | true | true/false | Enable smart money discovery |
| `paths.volume_momentum.enabled` | false | true/false | Enable volume/momentum discovery |
| `paths.graduation.enabled` | false | true/false | Enable graduation event discovery |
| `paths.narrative.enabled` | false | true/false | Enable narrative discovery |
| `paths.onchain_anomaly.enabled` | false | true/false | Enable on-chain anomaly (requires Helius) |

### General Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `minLiquidityUsd` | 50,000 | 10,000 - 1,000,000 | Minimum liquidity floor (all paths) |
| `minVolume24h` | 120,000 | 50,000 - 5,000,000 | Minimum 24h volume (all paths) |
| `minPairAgeHours` | 1 | 0.5 - 24 | Minimum pair age (all paths) |
| `candidateCapPerPath` | 10 | 3 - 20 | Max candidates per path per cycle |
| `watchlistSize` | 8 | 3 - 20 | Tokens in final merged watchlist |
| `enableBuySellGate` | true | true/false | Require buys > sells |
| `enableCreatorFilter` | true | true/false | Filter aggressive creator selling |
| `compositeWeights` | (see defaults) | must sum to 1.0 | Per-signal weights |
| `alertThreshold` | 0.75 | 0.5 - 0.95 | Composite score for Telegram alerts |
| `convergenceBonus` | { 2: 0.05, 3: 0.10, 4: 0.15 } | Adjustable | Multi-path convergence bonus |

### Compute Optimization Parameters

| Parameter | Default | Description |
|---|---|---|
| `paths.*.cadence` | varies by path | How often each path runs |
| `enrichment.cacheMaxAgeMinutes` | 30 | Reuse enrichment data younger than this |
| `enrichment.timeoutSeconds` | 60 | Max time for enrichment pass |
| `enrichment.bestEffort` | true | Proceed if enrichment fails |
| `backtestBudget.maxPerCycle` | 5 | Max backtests across all paths per cycle |

### Example Conversations

**Getting started:**
```
User: "Start discovering Solana tokens"
Agent: "I'll set up token discovery. Which paths should I run?"
      [Smart money only] [Smart money + volume] [All paths] [Custom]
User: "Smart money and volume"
Agent: "Got it — SM and volume paths active. SM every 30 min, volume 
        every 30 min. $50k liquidity floor, top 8 tokens. Running 
        first pass now..."
```

**Adding a path:**
```
User: "Also watch pump.fun graduations"
Agent: "Graduation path enabled — scanning every 15 min for tokens 
        with accelerating buy pressure near graduation. I'll merge 
        grad candidates into your watchlist alongside SM and volume."
```

**Understanding convergence:**
```
User: "Why is WOJAK ranked #1?"
Agent: "WOJAK appeared in both the SM and volume paths this cycle — 
        7 whale wallets accumulating AND a 3.1x volume spike. The 
        convergence bonus of +0.05 pushed it above TOKEN2 which only 
        appeared in the SM path."
```

**Single token research (unchanged):**
```
User: "What do you know about WOJAK?"
Agent: [runs all sources against single token]
       "WOJAK — 7 SM wallets accumulating, $350k liquidity, graduated 
        3 days ago, holder count growing 15%/48h, moderate social 
        mentions. Composite: 0.87 (high). Sources: sm + vol convergence."
```

## Scheduling

Each discovery path runs on its own cadence via OpenClaw cron:

```bash
openclaw cron create --name "discovery-sm" --interval 30m \
  --mandate "Run smart money discovery path."
openclaw cron create --name "discovery-vol" --interval 30m \
  --mandate "Run volume/momentum discovery path."
openclaw cron create --name "discovery-grad" --interval 15m \
  --mandate "Run graduation discovery path."
openclaw cron create --name "discovery-narr" --interval 60m \
  --mandate "Run narrative discovery path."
```

Paths check for material data changes before running the full scoring pass. If the underlying data hasn't changed since the last run, the path returns the previous watchlist without re-scoring (fast-path optimization).

Each cycle produces:
1. Per-path watchlist JSONs (with `candidateSource` tags)
2. Merged, deduplicated, convergence-scored final watchlist
3. Feed health status
4. Telegram alert if configured thresholds are crossed

## Requirements

### MCP Servers

**Required (minimum viable discovery):**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  }
}
```

Agenti-lite provides DEX analytics, wallet analytics, market data, social data, news, and more through built-in modules. No API key needed — it uses public endpoints directly.

**Recommended (more paths):**
```json
{
  "pump-fun-sdk-lite": {
    "command": "node",
    "args": ["vendor/pump-fun-sdk-lite/dist/index.js"]
  },
  "crypto-news-lite": {
    "command": "node",
    "args": ["vendor/crypto-news-lite/dist/index.js"]
  },
  "helius": {
    "command": "npx",
    "args": ["-y", "@mcp-dockmaster/mcp-server-helius"],
    "env": { "HELIUS_API_KEY": "${HELIUS_API_KEY}" }
  }
}
```

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | SM + vol paths via agenti-lite | Yes (no key needed) |
| `ALCHEMY_API_KEY` | Enhanced RPC access | Optional |
| `BIRDEYE_API_KEY` | Trade volume enrichment | Recommended |
| `HELIUS_API_KEY` | On-chain anomaly path + holder enrichment | Optional |
| `LUNARCRUSH_API_KEY` | Social sentiment enrichment | Optional |

### WrenOS Components (included)

- `vendor/agenti-lite/` — DEX analytics, wallet analytics, market data, social, news, indicators
- `vendor/pump-fun-sdk-lite/` — pump.fun bonding curve data
- `vendor/crypto-news-lite/` — crypto news scanning
- `packs/meme-discovery-pack/` — pack config and handoff schema

## Feed Health

The skill monitors every data source on each run.

**Status values:**
- `ok` — responded with valid data
- `degraded` — responded but incomplete
- `error` — failed to respond
- `not_configured` — API key or MCP server not set up
- `enrichment_only` — known coverage gaps (e.g., LunarCrush for meme tokens)

**Path-level failure:**
- If a path's primary source fails, that path is skipped. Other paths continue.
- User notified in Telegram with which path failed and why.

**Enrichment feed failure:**
- Discovery continues with available data.
- Missing signals set to null, weights renormalized.
- Lower confidence tier noted in output.

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Inference routes through Speakeasy when configured
- Token addresses/symbols are logged for debugging (can be disabled)

## Error Handling

| Error | Action |
|---|---|
| No MCP servers configured | Guide user through setup |
| SM path returns 0 candidates | Other paths continue; suggest enabling more paths |
| Dexscreener rate limited | Retry with backoff (3 attempts) |
| Birdeye 401 | Skip enrichment, continue |
| pump-fun-sdk module error | Skip grad path, other paths continue |
| LunarCrush 429 | Skip social enrichment this run |
| All paths return 0 | Report to user with diagnostic |
| Enrichment timeout | Return candidates without enrichment |

## Data Retention

- Watchlist files: 7 days on disk, then rotated
- Feed health logs: 7 days
- Enrichment cache: 30 minutes
- Each path run is stateless (no persistent signal data between runs)
- Watchlist files excluded from git

## What This Skill Does NOT Do

- **Does not trade.** It discovers and ranks. Trading is handled by separate skills.
- **Does not manage risk.** No stops, no sizing, no drawdown monitoring.
- **Does not backtest.** Produces current-state watchlists. Backtesting is a separate skill.
- **Does not require all paths.** Works with just the SM path and zero API keys. More paths = wider discovery net.

## Compatibility

- **WrenOS**: v0.1.0+
- **OpenClaw**: 2026.3.2+
- **Agent Skills standard**: compatible
- **Downstream:** strategy-builder, risk-manager, performance-report, or any skill reading the meme-watchlist handoff schema. The `candidateSource` tag flows through to downstream skills for per-path performance tracking.

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

### Via ClawHub
```bash
clawhub install solana-token-discovery
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install at minimum `vendor/agenti-lite`
3. Configure `.mcp.json` with MCP servers
4. Set API keys in environment
5. Tell your agent: "Start discovering Solana tokens"

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

