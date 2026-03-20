---
name: token-deep-dive
description: "Comprehensive single-token research tool for WrenOS. Queries all configured data sources — smart money flow, DEX metrics, holder distribution, social sentiment, news mentions, bonding curve status, and trade data — to produce a complete snapshot of any Solana token. Not a discovery tool. A research tool for tokens you already know about."
---

# Token Deep Dive

Full-spectrum research report on any Solana token, pulled from every data source you have configured. You name the token — the agent queries everything and gives you the complete picture.

## How It Works

You ask your agent to analyze a specific token. The agent queries every configured MCP server and API in parallel, assembles the results into a structured snapshot, scores the token across multiple dimensions, and delivers the report to Telegram with a summary and the full breakdown.

This is not a discovery tool. It does not scan for candidates or produce watchlists. Use solana-token-discovery or pump-fun-monitor for that. Token deep dive is what you use when you already have a token and want to know everything about it before making a decision.

**Examples:**
```
"Analyze WOJAK for me"
"Deep dive on 5tN42n9vM... — what's the full picture?"
"Research BONK — holder distribution, smart money, liquidity, everything"
"Is this token safe? Check 7xQ93m... for red flags"
"Compare WOJAK and PEPE2 side by side"
"What changed with BONK since yesterday?"
```

## What You Get

A deep dive produces a structured report covering every dimension the configured sources can provide. Missing sources are skipped — you always get the best report your current setup allows.

### Smart Money Status
**Source:** Wallet analytics via agenti-lite MCP
**Tells you:** Are large/high-PnL wallets accumulating or distributing this token?
**Data returned:**
- Net inflow/outflow (USD and SOL)
- Number of distinct smart wallets active
- Inflow concentration (is it one whale or many?)
- Netflow ratio (buy pressure vs sell pressure)
- Smart money trend direction (accumulating / distributing / neutral)
- Largest single-wallet position change

### DEX Market Metrics
**Source:** DEX analytics via agenti-lite MCP (Dexscreener, CoinGecko)
**Tells you:** How is this token actually trading right now?
**Data returned:**
- Current price and FDV
- Liquidity depth (USD)
- 24h / 6h / 1h volume
- Buy/sell counts and USD volumes across timeframes
- Buy/sell ratio (are buyers or sellers dominant?)
- Price change across timeframes (5m, 1h, 6h, 24h)
- Pair age
- Number of active trading pairs

### Holder Distribution
**Source:** Helius MCP
**Tells you:** Who holds this token and how concentrated is ownership?
**Data returned:**
- Total holder count
- Holder growth rate (24h, 7d)
- Top-5 holder concentration (adjusted — excludes LP, burn, treasury, exchange, and program-owned accounts)
- Top-10 holder concentration (adjusted)
- Largest non-LP holder size
- Distribution trend (concentrating / distributing / stable)
- Estimated retail holder percentage

### Social Sentiment
**Source:** LunarCrush API
**Tells you:** Does this token have social momentum?
**Data returned:**
- Galaxy score
- Social engagement volume
- Mention velocity (mentions per hour, trend direction)
- Dominant sentiment (bullish / bearish / neutral)
- Top platforms driving mentions
- Social rank relative to other Solana tokens

### News & Narrative
**Source:** crypto-news-lite MCP
**Tells you:** Is there a catalyst or narrative driving attention?
**Data returned:**
- Mention count (24h)
- Source diversity (how many distinct outlets)
- Narrative classification (AI, meme, DeFi, gaming, political, celebrity, etc.)
- Engagement quality score
- Latest headline summary
- Multi-source confirmation (same story from independent sources?)

### Bonding Curve / Pump.fun Status
**Source:** pump-fun-sdk-lite MCP
**Tells you:** Is this token pre-graduation, and if so, how close?
**Data returned:**
- Graduation status (pre-graduation / graduated / not a pump.fun token)
- Curve completion percentage (if pre-graduation)
- SOL deposited / SOL target / SOL remaining
- Buy velocity and acceleration
- Estimated time to graduation
- Creator wallet behavior (holding / selling / transferred)

### Trade-Level Data
**Source:** Birdeye API
**Tells you:** What does actual trading activity look like at the transaction level?
**Data returned:**
- Recent trade volume confirmation
- Buyer/seller composition (unique wallets)
- Average trade size
- Estimated slippage at common position sizes ($500, $1k, $5k)
- Execution quality assessment

## Report Scoring

Each deep dive includes a multi-dimensional score card. Every dimension is scored 0 to 1, and an overall composite is computed from active sources.

**Dimensions and default weights:**

| Dimension | Weight | What it measures |
|---|---|---|
| Smart Money Conviction | 25% | Net inflow strength, wallet count, concentration |
| Liquidity Quality | 20% | Depth, pair age, slippage estimate |
| Momentum | 15% | Price trend, volume trend, buy/sell ratio |
| Holder Health | 15% | Distribution quality, growth rate, concentration risk |
| Social Signal | 10% | Mention velocity, engagement quality, sentiment |
| Narrative Strength | 5% | News coverage, source diversity, catalyst presence |
| Pump Status | 5% | Graduation proximity and velocity (0 if already graduated or not pump.fun) |
| Execution Quality | 5% | Slippage, trade size consistency, wash-trade indicators |

**Weight redistribution:** If a source is unavailable, its weight redistributes proportionally. Same logic as solana-token-discovery and pump-fun-monitor.

**Overall composite interpretation:**
- `0.80+` — Strong across most dimensions. High-conviction candidate.
- `0.65 - 0.79` — Solid with some mixed signals. Worth watching.
- `0.50 - 0.64` — Average. Specific strengths but notable weaknesses.
- `< 0.50` — Weak or insufficient data. Caution.

## Red Flag Detection

Beyond scoring, the deep dive explicitly flags risk conditions:

| Red Flag | Trigger | Severity |
|---|---|---|
| Whale Concentration | Top-5 adjusted holders > 40% | High |
| Creator Dump Risk | Creator sold > 20% of holding | High |
| Liquidity Thin | < $50k liquidity | High |
| Volume Fake | Buy/sell counts high but unique wallets low | High |
| Smart Money Exit | SM netflow negative with 5+ wallets selling | Medium |
| Holder Decline | Holder count dropping > 5% in 24h | Medium |
| No Social Signal | Zero mentions across all social sources | Low |
| Single Pair | Only one active trading pair | Low |

Red flags are surfaced prominently in the Telegram report and included in the output JSON.

## Identity Resolution

Same as other WrenOS skills: every token keyed by `chain:address`, not symbol.

```
canonical key: solana:{mint_address}
display: {symbol} ({mint_address_short})
```

Users can request a deep dive by symbol or by mint address. If a symbol maps to multiple tokens (common in meme tokens), the agent asks for clarification or defaults to the highest-liquidity match.

## Output Format

### Telegram Report

```
🔍 DEEP DIVE — WOJAK (5tN42n...)

Overall: 0.82 (strong)
🟢 Smart Money: 0.91 — 7 wallets accumulating, 2.3x netflow
🟢 Liquidity: 0.88 — $350k depth, clean execution
🟡 Momentum: 0.75 — +12.5% 1h, buys > sells
🟢 Holders: 0.83 — 2,847 holders, growing 15%/48h
🟡 Social: 0.60 — moderate mentions, neutral sentiment
🟡 Narrative: 0.55 — 12 news mentions, no strong catalyst
⚪ Pump: N/A — graduated 3 days ago
🟢 Execution: 0.85 — <50 bps slippage at $1k

⚠️ Red Flags: none detected

Evidence: 7 SM wallets accumulating, $350k liq, 2.3x buy/sell 
  ratio 1h, holder count growing, graduated pump.fun
Invalidation: SM netflow reversal or liquidity drop below $100k
```

### Comparison Report (multi-token)

When comparing tokens side by side:

```
🔍 COMPARISON — WOJAK vs PEPE2

              WOJAK    PEPE2
Overall:      0.82     0.71
Smart Money:  0.91     0.45
Liquidity:    0.88     0.92
Momentum:     0.75     0.81
Holders:      0.83     0.62
Social:       0.60     0.78
Red Flags:    0        1 (whale concentration)

Edge: WOJAK has stronger smart money conviction.
      PEPE2 has better momentum and social signal.
```

### Output File (handoff format)

Written to the agent's `inbox/` directory. In a multi-agent deployment, the research agent writes to the trading agent's inbox.

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "token-deep-dive",
  "token": {
    "symbol": "WOJAK",
    "address": "5tN42n9vM...",
    "chain": "solana"
  },
  "compositeScore": 0.82,
  "confidenceTier": "high",
  "dimensions": {
    "smartMoney": {
      "score": 0.91,
      "netInflow": 45000,
      "walletCount": 7,
      "netflowRatio": 2.3,
      "trend": "accumulating",
      "source": "nansen"
    },
    "liquidity": {
      "score": 0.88,
      "liquidityUsd": 350000,
      "pairAge": "3d",
      "activePairs": 2,
      "source": "dexscreener"
    },
    "momentum": {
      "score": 0.75,
      "priceChange1h": 12.5,
      "priceChange24h": 34.2,
      "volume24h": 1200000,
      "buySellRatio1h": 2.3,
      "source": "dexscreener"
    },
    "holders": {
      "score": 0.83,
      "holderCount": 2847,
      "holderGrowth24h": 0.15,
      "top5AdjustedPct": 0.18,
      "distributionTrend": "distributing",
      "source": "helius"
    },
    "social": {
      "score": 0.60,
      "galaxyScore": 62,
      "mentionVelocity": 8.5,
      "sentiment": "neutral",
      "source": "lunarcrush"
    },
    "narrative": {
      "score": 0.55,
      "mentionCount": 12,
      "sourceDiversity": 4,
      "classification": "meme",
      "source": "crypto-news-lite"
    },
    "pumpStatus": {
      "score": null,
      "isGraduated": true,
      "graduatedAt": "2026-03-07T14:22:00.000Z",
      "source": "pump-fun-sdk-lite"
    },
    "execution": {
      "score": 0.85,
      "slippage1k": 42,
      "slippage5k": 180,
      "uniqueBuyers24h": 312,
      "source": "birdeye"
    }
  },
  "redFlags": [],
  "evidence": "7 SM wallets accumulating, $350k liq, 2.3x buy/sell ratio 1h, holder count growing, graduated pump.fun",
  "invalidation": "SM netflow reversal or liquidity drop below $100k",
  "sourcesQueried": ["nansen", "dexscreener", "helius", "lunarcrush", "crypto-news-lite", "pump-fun-sdk-lite", "birdeye"],
  "sourcesMissing": [],
  "feed_health": {
    "nansen": "ok",
    "dexscreener": "ok",
    "helius": "ok",
    "lunarcrush": "ok",
    "cryptoNews": "ok",
    "pumpFun": "ok",
    "birdeye": "ok"
  }
}
```

**Output location:** `inbox/deep-dive-{symbol}-{timestamp}.json`

## User Configuration

All parameters are configurable through Telegram conversation.

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `dimensionWeights` | (see defaults) | must sum to 1.0 | Per-dimension scoring weights |
| `enableRedFlagDetection` | true | true/false | Surface red flags in report |
| `slippageTestSizes` | [500, 1000, 5000] | array of USD values | Position sizes for slippage estimate |
| `includeComparison` | false | true/false | Side-by-side when multiple tokens requested |
| `outputVerbosity` | "standard" | brief / standard / full | Telegram report detail level |
| `holderAdjustExclusions` | ["lp", "burn", "treasury", "exchange", "program"] | array | Account types excluded from holder concentration |
| `redFlagThresholds` | (see defaults) | per-flag | Customize when each red flag triggers |

### Example Conversations

**Basic research:**
```
User: "Analyze WOJAK for me"
Agent: [queries all configured sources in parallel]
       "🔍 DEEP DIVE — WOJAK (5tN42n...)
        Overall: 0.82 (strong)
        ..."
```

**By address:**
```
User: "Deep dive on 5tN42n9vM..."
Agent: [resolves address to WOJAK, runs full analysis]
       "That's WOJAK. Running full analysis..."
```

**Red flag check:**
```
User: "Is this token safe? Check 7xQ93m..."
Agent: [runs analysis with red flag detection priority]
       "Found 2 red flags:
        🔴 Whale concentration — top 5 holders control 52%
        🔴 Creator dump risk — creator sold 35% of holding
        Overall score: 0.38 (weak). Recommend caution."
```

**Comparison:**
```
User: "Compare WOJAK and PEPE2"
Agent: [runs deep dive on both, produces side-by-side]
       "🔍 COMPARISON — WOJAK vs PEPE2
        ..."
```

**Focused question:**
```
User: "What's the holder distribution for BONK?"
Agent: [runs full deep dive but highlights holder section]
       "BONK holder breakdown:
        12,847 total holders (+8% 7d)
        Top 5 adjusted: 12% (healthy)
        Distribution trend: gradually distributing
        Full deep dive score: 0.74 (solid)"
```

**Change tracking:**
```
User: "What changed with WOJAK since yesterday?"
Agent: [runs current deep dive, compares to most recent 
        cached report if available]
       "WOJAK changes since last deep dive (18h ago):
        Smart money: 0.91 → 0.88 (2 wallets reduced position)
        Liquidity: $350k → $410k (+17%)
        Holders: 2,847 → 3,102 (+9%)
        Overall: 0.82 → 0.80 (slight SM cooling, 
                 offset by liquidity and holder growth)"
```

## Scheduling

Deep dives are on-demand by default — you ask, the agent runs one. For tokens you're actively watching, you can schedule recurring deep dives:

```bash
openclaw cron create --name "deep-dive-WOJAK" \
  --expression "0 */4 * * *" \
  --mandate "Run token-deep-dive on WOJAK. 
             Compare to previous report. 
             Alert if any dimension drops >15% or new red flag appears."
```

Each scheduled run produces:
1. A deep dive JSON in `inbox/`
2. Telegram summary (always for scheduled runs, or only-on-change if configured)
3. Delta comparison to previous report (if available)

## Requirements

### MCP Servers

**Required (minimum viable deep dive):**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  }
}
```

Agenti-lite (`universal-crypto-mcp` under the hood) provides DEX analytics, market data, wallet analytics, social data, news, indicators, and more through built-in modules. No API key is required for core functionality — it uses public endpoints (Dexscreener, CoinGecko, etc.) directly. Optional env vars like `ALCHEMY_API_KEY` enhance RPC access but are not needed to get started.

**Recommended (full-spectrum analysis):**
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
| (none) | DEX data, market data, wallet analytics, social, news via agenti-lite | Yes (no key needed) |
| `ALCHEMY_API_KEY` | Enhanced RPC access for agenti-lite | Optional |
| `HELIUS_API_KEY` | Holder distribution analysis | Recommended |
| `BIRDEYE_API_KEY` | Trade-level data + slippage estimates | Optional |
| `LUNARCRUSH_API_KEY` | Social sentiment (enhanced) | Optional |

**Minimum setup:** agenti-lite works with zero API keys using public endpoints (Dexscreener, CoinGecko, etc.). This alone gives you DEX metrics, market data, wallet analytics, and momentum — enough for a useful report. Each additional key adds depth.

### WrenOS Components (included)

- `vendor/agenti-lite/` — DEX analytics, market data, wallet analytics, social, news, indicators (universal-crypto-mcp)
- `vendor/pump-fun-sdk-lite/` — pump.fun bonding curve data
- `vendor/crypto-news-lite/` — crypto news scanning
- `packs/meme-discovery-pack/` — pack config and handoff schema

## Feed Health

The skill reports which sources responded and which failed for each deep dive.

**Status values:**
- `ok` — responded with valid data
- `degraded` — responded but incomplete
- `error` — failed to respond
- `not_configured` — API key or MCP server not set up
- `enrichment_only` — known coverage gaps

**On source failure:** The deep dive continues with available sources. Missing dimensions are scored as `null`, their weight redistributes, and the report notes which sources were unavailable. The `confidenceTier` drops accordingly:
- All sources responding → `high`
- agenti-lite responding, some enrichment sources missing → `medium`
- Only enrichment sources responding (agenti-lite down) → `low`
- No sources responding → report aborted, user notified

### Heartbeat Compatibility

The `feed_health` block in deep dive output is readable by the heartbeat supervisor agent. If deep dives are scheduled, degraded feed status will be visible during heartbeat checks.

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Inference routes through Speakeasy when configured
- Token addresses/symbols logged for debugging (can be disabled)
- Deep dive reports may contain wallet addresses (smart money, creator) — these come from public blockchain data, not private user data

## Error Handling

| Error | Action |
|---|---|
| No API keys configured | Guide user through setup |
| Token not found on any source | Report "token not found" with address verification prompt |
| Symbol ambiguous (multiple matches) | Ask user to clarify or pick highest-liquidity match |
| Nansen rate limited | Skip smart money dimension, continue |
| Dexscreener rate limited | Retry with backoff (3 attempts), then skip |
| Helius 401 | Skip holder analysis, continue |
| Birdeye 401 | Skip execution quality, continue |
| LunarCrush 429 | Skip social, continue |
| All sources fail | Abort, notify user, suggest checking API keys |

## Data Retention

- Deep dive files: 7 days on disk, then rotated
- Used for change-tracking comparisons (current vs previous report)
- Feed health logs: 7 days
- Each deep dive is a point-in-time snapshot (no persistent state)
- All files excluded from git

## Relationship to Other Skills

### Upstream: solana-token-discovery, pump-fun-monitor
Discovery skills find candidates. Deep dive analyzes them in detail. A common workflow: discovery surfaces a watchlist → user picks a token → deep dive runs the full analysis.

### Downstream: strategy-builder, risk-manager
Deep dive output includes the composite score, dimension breakdown, and red flags. A trading agent can use this to inform position sizing, entry decisions, or risk assessment. The output JSON follows the same handoff schema patterns as other WrenOS skills.

### Parallel: heartbeat-monitor
Scheduled deep dives produce `feed_health` output readable by the heartbeat supervisor. No special integration needed.

## What This Skill Does NOT Do

- **Does not discover tokens.** It analyzes tokens you specify. Use solana-token-discovery for scanning.
- **Does not trade.** It produces research reports. Trading is handled by separate skills.
- **Does not manage risk.** It flags risks but does not enforce stops or sizing.
- **Does not monitor continuously.** It produces point-in-time snapshots. Use pump-fun-monitor for real-time surveillance.
- **Does not require all sources.** Works with just `AGENTI_API_KEY`. More sources = more dimensions covered.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Upstream:** solana-token-discovery, pump-fun-monitor (feeds candidates for analysis)
- **Downstream:** strategy-builder, risk-manager, or any skill reading deep dive output
- **Heartbeat-aware:** feed_health output readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

The meme-discovery pack includes solana-token-discovery, pump-fun-monitor, and token-deep-dive.

### Via ClawHub
```bash
clawhub install token-deep-dive
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install at minimum `vendor/agenti-lite`
3. Configure `.mcp.json` with MCP servers
4. Set API keys in environment
5. Tell your agent: "Analyze WOJAK for me"

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

