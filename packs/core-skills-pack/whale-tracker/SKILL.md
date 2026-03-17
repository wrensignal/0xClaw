---
name: whale-tracker
description: "Large wallet tracking and accumulation/distribution monitor for WrenOS. Tracks what high-value wallets are buying and selling on Solana, detects accumulation patterns, monitors exchange flows, and alerts users via Telegram when significant whale activity is detected. Uses agenti-lite wallet analytics, crypto-news-lite whale alerts, and optional Helius for on-chain depth. Zero API keys required for core functionality."
---

# Whale Tracker

Tracks what the biggest wallets on Solana are doing. Detects accumulation, distribution, exchange flows, and large transactions — then alerts you when something significant happens.

## How It Works

You tell your agent what kind of whale activity you care about. The agent monitors wallet analytics data, whale transaction alerts, and exchange flow patterns, then notifies you in Telegram when your thresholds are crossed. You can track the market broadly or watch specific wallets.

This is not a token discovery tool — it's a wallet behavior intelligence tool. It tells you what large players are doing, not which tokens look promising. Use it alongside solana-token-discovery to connect wallet behavior to tradable opportunities.

**Examples:**
```
"Show me what the top smart money wallets bought this week"
"Alert me when any whale buys more than $100k of a Solana token"
"Track exchange flows — alert on large outflows"
"Watch these wallets for new positions: [addresses]"
"Which tokens are whales accumulating right now?"
"Show me whale sells above $50k in the last 24 hours"
"Alert me on large exchange withdrawals of any Solana token"
```

## Data Sources

### agenti-lite wallet analytics (primary — no API key)
Built-in wallet analytics module providing:
- Wallet portfolio tracking and position changes
- Smart money flow detection (accumulation/distribution patterns)
- Wallet-to-wallet transfer analysis
- Position sizing and concentration data

### crypto-news-lite whale tools (primary — no API key)
Built-in tools from the 49-tool crypto-news-lite MCP:
- `get_whale_alerts` — large transaction alerts with configurable minimum USD threshold
- `get_exchange_flows` — exchange inflow/outflow tracking (accumulation vs distribution signal)
- `get_token_unlocks` — upcoming token unlock schedules (supply pressure signal)
- `get_liquidations` — liquidation data (forced selling / cascading sell signal)

### Helius (optional — enhanced on-chain depth)
Deep Solana-native on-chain analysis:
- Full transaction history for any wallet
- Token transfer patterns and associated wallets
- Holder distribution changes over time
- Program interaction analysis

**Requires:** `HELIUS_API_KEY`

## Monitoring Modes

### Accumulation Watch (default)
Track tokens where large wallets are building positions.
```
"Which tokens are whales accumulating?"
```
**Tracks:** Net inflow from high-value wallets across Solana tokens.
**Alerts on:** New accumulation pattern detected (multiple large wallets buying the same token within a time window).
**Pipeline:** Wallet analytics scan → accumulation filter → concentration check → alert

### Distribution Watch
Track tokens where large wallets are exiting.
```
"Alert me when whales start selling a token I'm watching"
```
**Tracks:** Net outflow from high-value wallets for specified tokens.
**Alerts on:** Distribution pattern detected (multiple large wallets selling, or single whale dumping above threshold).
**Pipeline:** Wallet analytics scan → distribution filter → severity scoring → alert

### Large Transaction Alerts
Real-time alerts on individual whale transactions.
```
"Alert me on any whale trade above $100k"
```
**Tracks:** Individual transactions exceeding the configured USD threshold.
**Alerts on:** Each qualifying transaction.
**Pipeline:** Whale alerts poll → threshold filter → token enrichment → alert

### Exchange Flow Monitor
Track tokens moving in and out of exchanges.
```
"Track exchange flows — alert on large outflows"
```
**Tracks:** Net exchange inflow/outflow for Solana tokens.
**Alerts on:** Large outflow (accumulation signal) or large inflow (sell pressure signal) exceeding threshold.
**Pipeline:** Exchange flow scan → direction filter → magnitude check → alert

### Wallet Watchlist
Track specific wallet addresses for any activity.
```
"Watch these wallets: [addresses]"
```
**Tracks:** All token transactions for specified wallets.
**Alerts on:** New position opened, position size change above threshold, position closed.
**Pipeline:** Wallet activity poll → position diff → significance filter → alert

### Weekly Report
Summary of whale activity over a time window.
```
"Show me what the top smart money wallets bought this week"
```
**Returns:** Ranked list of tokens by net whale accumulation over the specified period, with wallet counts, net flows, and price change during the accumulation window. On-demand, not a persistent monitor.

### Custom Monitor
Combine any conditions.
```
"Alert me when 5+ large wallets buy the same token within 
 4 hours, the total inflow exceeds $500k, and there's also
 an exchange outflow spike"
```
The agent assembles a custom monitoring rule from the conditions specified.

## Signal Data

### Wallet Activity Data
| Field | Type | Description |
|---|---|---|
| `walletAddress` | string | Wallet address |
| `walletLabel` | string | Known label (if available — e.g., "Jump Trading", "Alameda") |
| `action` | string | "buy" / "sell" / "transfer_in" / "transfer_out" |
| `tokenAddress` | string | Token mint address |
| `tokenSymbol` | string | Token symbol |
| `amountUsd` | float | Transaction value in USD |
| `amountToken` | float | Token quantity |
| `timestamp` | timestamp | Transaction time |
| `txSignature` | string | Solana transaction signature |

### Accumulation/Distribution Data
| Field | Type | Description |
|---|---|---|
| `tokenAddress` | string | Token mint address |
| `tokenSymbol` | string | Token symbol |
| `netFlowUsd` | float | Net USD flow (positive = accumulation, negative = distribution) |
| `walletCount` | int | Number of distinct large wallets active |
| `buyWallets` | int | Wallets accumulating |
| `sellWallets` | int | Wallets distributing |
| `largestSingleFlow` | float | Biggest individual wallet net flow |
| `timeWindow` | string | Observation window (e.g., "24h", "7d") |
| `pattern` | string | "accumulating" / "distributing" / "mixed" / "inactive" |

### Exchange Flow Data
| Field | Type | Description |
|---|---|---|
| `tokenAddress` | string | Token mint address |
| `tokenSymbol` | string | Token symbol |
| `exchangeInflow` | float | USD value flowing into exchanges |
| `exchangeOutflow` | float | USD value flowing out of exchanges |
| `netFlow` | float | Net flow (positive = into exchanges = sell pressure) |
| `flowDirection` | string | "inflow" / "outflow" / "balanced" |
| `magnitude` | string | "normal" / "elevated" / "extreme" |

### Wallet Profile Data (with Helius)
| Field | Type | Description |
|---|---|---|
| `walletAddress` | string | Wallet address |
| `totalValueUsd` | float | Estimated portfolio value |
| `topHoldings` | array | Largest token positions |
| `recentActivity` | array | Last N transactions |
| `associatedWallets` | array | Linked wallets (if detected) |
| `walletAge` | string | Time since first transaction |
| `tradeFrequency` | string | "active" / "moderate" / "dormant" |

## Scoring

Each tracked token receives a whale conviction score (0 to 1) measuring how strong the whale signal is.

**Default weights:**

| Signal | Weight | Description |
|---|---|---|
| Net Flow Magnitude | 30% | USD volume of whale activity relative to token market cap |
| Wallet Count | 25% | More distinct wallets = higher conviction than single whale |
| Flow Consistency | 20% | Sustained accumulation > single burst |
| Exchange Flow Alignment | 15% | Exchange outflows confirming wallet accumulation |
| Wallet Quality | 10% | Known profitable wallets weighted higher than unknown |

**Score interpretation:**
- `0.80+` — Strong multi-wallet accumulation with exchange flow confirmation
- `0.60 - 0.79` — Notable activity from multiple wallets, some signals mixed
- `0.40 - 0.59` — Single whale or inconsistent pattern
- `< 0.40` — Weak or noise-level activity

## Red Flags

The tracker explicitly flags suspicious whale patterns:

| Red Flag | Trigger | Description |
|---|---|---|
| Wash Trading | Same wallet buying and selling same token repeatedly | Fake volume / self-dealing |
| Coordinated Dump | 3+ wallets selling same token within 1 hour | Possible coordinated exit |
| Exchange Inflow Spike | 5x+ normal exchange inflow for a token | Sell pressure incoming |
| Single Whale Dominance | One wallet > 60% of total whale flow | Single-actor risk |
| Post-Unlock Selling | Large sells within 48h of token unlock event | Supply pressure |

## Identity Resolution

Wallets keyed by address. Tokens keyed by `chain:address` (same as other WrenOS skills).

Known wallet labels (exchange wallets, fund wallets, protocol treasuries) are applied when available from data sources. Unknown wallets display as truncated addresses.

## Output Format

### Whale Alert (pushed to Telegram)

```
🐋 WHALE ALERT — WOJAK (5tN42n...)

Activity: Accumulation
Wallets: 5 buying, 0 selling
Net inflow: $340k (24h)
Largest buyer: $120k (wallet 7xQ9...)
Exchange flow: outflow ($85k net)
Whale Score: 0.83

Pattern: Sustained accumulation over 12 hours
Price during window: +8.2%
```

### Distribution Alert

```
🐋 WHALE SELL — BONK (DezX...)

Activity: Distribution
Wallets: 1 selling, 3 buying
Net outflow: -$180k (4h)
Largest seller: $180k (wallet Ab12...)
Exchange flow: inflow ($45k net)
Whale Score: 0.35

⚠️ Red Flag: Single whale dominance (100% of sell flow)
```

### Large Transaction Alert

```
🐋 LARGE TX — $250k buy

Token: WOJAK (5tN42n...)
Wallet: 7xQ93m... (unlabeled)
Amount: 2.4M WOJAK ($250,000)
Type: DEX buy
Time: 2 minutes ago
TX: [solscan link]
```

### Exchange Flow Alert

```
📊 EXCHANGE OUTFLOW — WOJAK

Net outflow: $420k (6h)
Direction: out of exchanges (accumulation signal)
Magnitude: extreme (12x normal)
Inflow: $30k | Outflow: $450k

Context: 3 large withdrawal TXs, biggest $180k
```

### Output File (handoff format)

Written to the agent's `inbox/` directory for downstream skill consumption.

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "whale-tracker",
  "monitoringMode": "accumulation_watch",
  "alerts": [
    {
      "tokenAddress": "5tN42n9vM...",
      "tokenSymbol": "WOJAK",
      "chain": "solana",
      "whaleScore": 0.83,
      "activity": {
        "pattern": "accumulating",
        "netFlowUsd": 340000,
        "walletCount": 5,
        "buyWallets": 5,
        "sellWallets": 0,
        "largestSingleFlow": 120000,
        "timeWindow": "24h"
      },
      "exchangeFlow": {
        "netFlow": -85000,
        "flowDirection": "outflow",
        "magnitude": "elevated"
      },
      "transactions": [
        {
          "walletAddress": "7xQ93m...",
          "action": "buy",
          "amountUsd": 120000,
          "timestamp": "2026-03-10T06:15:00.000Z"
        }
      ],
      "redFlags": [],
      "evidence": "5 wallets accumulating $340k over 24h, exchange outflow confirming, no red flags",
      "priceChangeDuringWindow": 8.2
    }
  ],
  "marketContext": {
    "totalWhaleAlerts24h": 47,
    "netExchangeFlow": "outflow",
    "topAccumulated": ["WOJAK", "BONK", "AGNT"]
  },
  "feed_health": {
    "walletAnalytics": "ok",
    "whaleAlerts": "ok",
    "exchangeFlows": "ok",
    "helius": "not_configured"
  },
  "config": {
    "activeSources": ["agenti_wallet", "crypto_news_whales"],
    "monitoringMode": "accumulation_watch",
    "minTransactionUsd": 50000,
    "minWalletCount": 3,
    "timeWindow": "24h",
    "scanIntervalMins": 15
  }
}
```

**Output location:** `inbox/whale-tracker-{timestamp}.json`

### Heartbeat Compatibility

The `feed_health` block is readable by the heartbeat supervisor agent during its check cycle.

## User Configuration

All parameters are configurable through Telegram conversation.

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `monitoringMode` | "accumulation_watch" | see modes | Default monitoring approach |
| `minTransactionUsd` | 50,000 | 10,000 - 10,000,000 | Minimum USD value for individual transaction alerts |
| `minWalletCount` | 3 | 1 - 20 | Minimum distinct wallets for accumulation/distribution pattern |
| `timeWindow` | "24h" | 1h / 4h / 24h / 7d | Observation window for pattern detection |
| `watchlistAddresses` | [] | array of addresses | Specific wallets to track |
| `watchlistTokens` | [] | array of symbols/addresses | Specific tokens to track whale activity for |
| `exchangeFlowThreshold` | 3.0 | 1.0 - 10.0 | Multiplier vs normal flow to trigger exchange flow alert |
| `scanIntervalMins` | 15 | 5 - 60 | How often to scan for updates |
| `enableRedFlags` | true | true/false | Surface suspicious patterns |
| `enableExchangeFlows` | true | true/false | Include exchange flow monitoring |
| `enableLargeTransactionAlerts` | true | true/false | Alert on individual large transactions |
| `whaleScoreWeights` | (see defaults) | must sum to 1.0 | Per-signal weights |
| `maxAlertsPerHour` | 10 | 1 - 50 | Rate limit on Telegram alerts |

### Example Conversations

**Getting started:**
```
User: "Track whale activity on Solana"
Agent: "Whale tracker active. Monitoring for accumulation 
        patterns — 3+ wallets, $50k+ transactions, 24h window. 
        Scanning every 15 minutes."
```

**Specific tokens:**
```
User: "Track whale activity for WOJAK and BONK"
Agent: "Added WOJAK and BONK to whale watchlist. I'll alert 
        on accumulation, distribution, and large transactions 
        for both tokens."
```

**Wallet watchlist:**
```
User: "Watch these wallets: 7xQ93m..., Ab12cd..."
Agent: "Added 2 wallets to watchlist. I'll alert when either 
        opens a new position, changes position size by $50k+, 
        or exits a position."
```

**Weekly summary:**
```
User: "What did the top whales buy this week?"
Agent: "Top whale accumulation this week:
        1. WOJAK — 8 wallets, $1.2M net inflow, +34% price
        2. AGNT — 5 wallets, $680k net inflow, +22% price
        3. BONK — 4 wallets, $450k net inflow, +12% price
        Exchange flows confirm outflow for all three."
```

**Exchange flows:**
```
User: "Show me exchange flow data for Solana tokens"
Agent: "Exchange flow summary (24h):
        Largest outflows (accumulation signal):
        - WOJAK: $420k net outflow
        - SOL: $2.1M net outflow
        Largest inflows (sell pressure signal):
        - MEME: $180k net inflow
        - DOGE2: $95k net inflow"
```

**Tightening filters:**
```
User: "Only alert me on $200k+ transactions and 5+ wallets"
Agent: "Updated: transaction threshold $200k, minimum 5 wallets 
        for pattern detection. Monitoring."
```

## Scheduling

The tracker runs on a configurable cron interval:

```bash
openclaw cron create --name "whale-tracker" \
  --expression "*/15 * * * *" \
  --mandate "Run whale-tracker with current user config. 
             Check accumulation patterns, exchange flows, 
             and large transactions. Alert on threshold crossings."
```

Each scan cycle produces:
1. Updated tracker JSON in `inbox/` (overwritten each cycle)
2. Telegram alert if any token/wallet crosses thresholds
3. Large transaction alert for individual qualifying transactions

**Alert deduplication:** Each pattern/transaction only triggers one alert. Dedup cache stored at `memory/whale-tracker-dedup.json`, persists across cron invocations, 24h expiry. Individual large transactions are deduped by transaction signature.

## Requirements

### MCP Servers

**Required (minimum viable tracking):**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  },
  "crypto-news-lite": {
    "command": "node",
    "args": ["vendor/crypto-news-lite/mcp/index.js"]
  }
}
```

agenti-lite provides wallet analytics (portfolio tracking, smart money flow, position changes). crypto-news-lite provides whale alerts (`get_whale_alerts`), exchange flows (`get_exchange_flows`), and token unlock data (`get_token_unlocks`). Both work with zero API keys.

**Recommended (deeper on-chain analysis):**
```json
{
  "helius": {
    "command": "npx",
    "args": ["-y", "@mcp-dockmaster/mcp-server-helius"],
    "env": { "HELIUS_API_KEY": "${HELIUS_API_KEY}" }
  }
}
```

Helius adds full Solana transaction history per wallet, token transfer tracing, associated wallet detection, and detailed holder analysis.

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Wallet analytics via agenti-lite | Yes (no key needed) |
| (none) | Whale alerts + exchange flows via crypto-news-lite | Yes (no key needed) |
| `HELIUS_API_KEY` | Deep on-chain wallet analysis, transfer tracing | Optional |

**This skill works with zero API keys.** agenti-lite and crypto-news-lite both use public endpoints out of the box. Helius adds on-chain depth but is not required.

### WrenOS Components (included)

- `vendor/agenti-lite/` — wallet analytics, market data (universal-crypto-mcp)
- `vendor/crypto-news-lite/` — whale alerts, exchange flows, token unlocks (free-crypto-news)
- `packs/meme-discovery-pack/` — pack config and handoff schema

## Feed Health

The skill monitors data source status on each scan cycle.

**Status values:**
- `ok` — responded with valid data
- `degraded` — responded but incomplete or slow
- `error` — failed to respond
- `not_configured` — MCP server not set up

**Primary feed failure (both agenti-lite and crypto-news-lite down):**
- Tracking paused
- User notified in Telegram
- Last tracker output remains (marked stale)
- Auto-retry on next cron tick

**Partial feed failure (one source down):**
- Tracking continues with available source
- Coverage may be reduced — noted in output
- Whale score confidence adjusted downward

**Enrichment feed failure (Helius down):**
- Tracking continues without deep on-chain data
- Wallet profiles less detailed — noted in output

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Wallet addresses logged for monitoring (can be disabled)
- Inference routes through Speakeasy when configured
- Wallet watchlist addresses are stored locally in agent workspace only

## Error Handling

| Error | Action |
|---|---|
| No MCP servers configured | Guide user through setup |
| agenti-lite wallet module error | Fall back to crypto-news-lite whale alerts only |
| crypto-news-lite whale alerts fail | Fall back to agenti-lite wallet analytics only |
| Helius 401/403 | Skip deep on-chain analysis, continue with primary sources |
| Helius rate limited | Skip enrichment this cycle |
| Both primary sources fail | Pause, notify user, retry next tick |
| Telegram notification fails | Log error, retry next alert |

## Data Retention

- Tracker output file: overwritten each scan cycle (latest state only)
- Alert dedup cache: 24 hours (pruned each cycle)
- Feed health logs: 7 days
- Each scan is stateless beyond dedup cache
- All files excluded from git

## Relationship to Other Skills

### Upstream: none (primary intelligence source)
The whale tracker is an independent intelligence feed. It doesn't consume output from other skills.

### Downstream: solana-token-discovery, token-deep-dive, strategy-builder
Whale accumulation signals can inform discovery prioritization and deep dive analysis. Token deep dive includes whale data as one of its dimensions. Strategy evaluation can weight whale conviction in entry decisions.

### Parallel: crypto-news-scanner, pump-fun-monitor, heartbeat-monitor
The whale tracker monitors wallet behavior. The news scanner monitors narrative. Pump-fun-monitor watches graduation events. Heartbeat supervisor reads all three feed health outputs. Complementary coverage, no overlap.

## What This Skill Does NOT Do

- **Does not discover tokens.** It tracks wallet behavior. Use solana-token-discovery for token scanning.
- **Does not trade.** It provides wallet intelligence. Trading is handled by separate skills.
- **Does not identify wallets.** It uses labels when available from data sources but does not dox or deanonymize wallets.
- **Does not predict price.** Whale accumulation is a signal, not a guarantee.
- **Does not require any API keys.** Works out of the box with agenti-lite + crypto-news-lite.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Downstream:** solana-token-discovery, token-deep-dive, strategy-builder, or any skill reading whale tracker output
- **Heartbeat-aware:** feed_health output readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

The meme-discovery pack includes solana-token-discovery, pump-fun-monitor, token-deep-dive, crypto-news-scanner, and whale-tracker.

### Via ClawHub
```bash
clawhub install whale-tracker
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install `vendor/agenti-lite` and `vendor/crypto-news-lite`
3. Configure `.mcp.json` with both MCP servers
4. (Optional) Add Helius MCP for deep on-chain wallet analysis
5. Tell your agent: "Track whale activity on Solana"
