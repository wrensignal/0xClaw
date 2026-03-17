---
name: crypto-news-scanner
description: "Narrative and social sentiment monitor for WrenOS. Tracks news mentions, social momentum, trending topics, and narrative themes across crypto media and social platforms. Alerts users via Telegram when mention velocity spikes, sentiment shifts, or new narratives emerge around configurable topics or tokens. Uses crypto-news-lite (49 built-in tools, no API key) as the primary source, with agenti-lite social data and optional LunarCrush for enrichment."
---

# Crypto News Scanner

Narrative radar for the crypto market. Tracks news coverage, social sentiment, trending topics, and emerging narratives — then alerts you when something moves. You define what you care about, the agent watches for it.

## How It Works

You tell your agent which topics, tokens, or narrative themes to track. The agent continuously scans news sources, social platforms, and sentiment feeds, computes mention velocity and sentiment trends, and alerts you in Telegram when your thresholds are crossed.

This is not a token discovery tool — it's a narrative intelligence tool. It tells you what the market is talking about, how fast attention is shifting, and whether sentiment is bullish or bearish. Use it alongside solana-token-discovery to connect narrative momentum to tradable tokens.

**Examples:**
```
"Track narrative momentum for AI agent tokens"
"Alert me when any Solana meme token gets 50+ mentions in an hour"
"What's trending in crypto right now?"
"Watch for regulatory news about Solana"
"Track sentiment for WOJAK and BONK — alert me on shifts"
"Show me what crypto Twitter is talking about today"
"Alert me when Fear & Greed drops below 25"
```

## Data Sources

### crypto-news-lite (primary — 49 tools, no API key)
The backbone of this skill. Provides:

**News coverage:**
- Latest news from 130+ sources (`get_crypto_news`)
- Keyword search across all sources (`search_crypto_news`)
- Category-specific feeds: DeFi, Bitcoin, Ethereum, altcoins, NFTs, regulatory (`get_defi_news`, `get_regulatory_news`, etc.)
- Breaking news (last 2 hours) (`get_breaking_news`)
- Historical archive search (`get_archive`)
- Original source tracing (`find_original_sources`)

**Social & sentiment:**
- Twitter/Reddit/Telegram sentiment tracking (`get_social_sentiment`)
- Trending topics with sentiment scores (`get_trending_topics`)
- AI-powered sentiment analysis per asset (`get_ai_sentiment`)
- AI-generated news summaries (`get_ai_summary`)
- AI market briefs (`get_ai_market_brief`)
- Topic classification and sentiment analysis (`analyze_news`)
- Natural language Q&A about market events (`ask_crypto_question`)

**Market context:**
- Fear & Greed Index (`get_fear_greed_index`)
- Whale alerts (`get_whale_alerts`)
- Exchange flows (`get_exchange_flows`)
- Funding rates (`get_funding_rates`)
- Liquidation data (`get_liquidations`)

### agenti-lite social module (secondary — no API key)
Supplements crypto-news-lite with additional social analytics from agenti-lite's built-in social and news modules.

### LunarCrush (optional enrichment)
Enhanced per-token social metrics: galaxy score, engagement depth, platform-level breakdowns.
**Requires:** `LUNARCRUSH_API_KEY`
**Note:** Coverage for small meme tokens is incomplete. Treated as enrichment, not a primary signal.

## Monitoring Modes

### Topic Watch (default)
Track mentions and sentiment for specific topics or narrative themes.
```
"Track AI agent tokens"
```
**Tracks:** Mention count, mention velocity, sentiment trend, source diversity for the specified topic.
**Alerts on:** Velocity spike (mentions/hour exceeds threshold) or sentiment shift (bullish→bearish or vice versa).
**Pipeline:** News scan + social scan → topic filter → velocity computation → sentiment scoring → alert

### Token Sentiment
Track news and social sentiment for specific tokens.
```
"Track sentiment for WOJAK and BONK"
```
**Tracks:** Per-token mention count, sentiment score, source breakdown, narrative classification.
**Alerts on:** Mention velocity spike, sentiment reversal, or new narrative emergence for the tracked token.
**Pipeline:** Token-specific search → social sentiment query → AI sentiment analysis → trend comparison → alert

### Trending Scanner
Discover what the market is talking about right now.
```
"What's trending in crypto?"
```
**Returns:** Top trending topics with sentiment, mention velocity, and dominant platforms. Not a persistent monitor — an on-demand snapshot.
**Pipeline:** Trending topics query → AI market brief → sentiment overlay → summary

### Breaking News Watch
Real-time alert on high-impact news.
```
"Alert me on breaking crypto news"
```
**Tracks:** News from the last 2 hours, filtered by engagement and source quality.
**Alerts on:** Any story matching configured relevance criteria (default: Solana-related or market-wide impact).
**Pipeline:** Breaking news poll → relevance filter → dedup → alert

### Regulatory Watch
Track regulatory and policy developments.
```
"Watch for regulatory news about Solana"
```
**Tracks:** SEC, CFTC, global regulation news filtered by keyword.
**Alerts on:** New regulatory story matching keywords.
**Pipeline:** Regulatory news scan → keyword filter → significance scoring → alert

### Fear & Greed Monitor
Track market-wide sentiment via the Fear & Greed Index.
```
"Alert me when Fear & Greed drops below 25"
```
**Tracks:** Fear & Greed Index value and trend direction.
**Alerts on:** Index crosses configured threshold (up or down).
**Pipeline:** Fear & Greed poll → threshold check → trend comparison → alert

### Custom Monitor
Combine any conditions.
```
"Alert me when Solana AI tokens get 100+ mentions/hour 
 with bullish sentiment and at least 3 independent sources"
```
The agent assembles a custom monitoring rule from the conditions specified.

## Signal Data

### Mention Analytics
| Field | Type | Description |
|---|---|---|
| `mentionCount1h` | int | Mentions in last 1 hour |
| `mentionCount24h` | int | Mentions in last 24 hours |
| `mentionVelocity` | float | Mentions per hour (current) |
| `velocityChange` | float | Velocity now vs 6h average. >1 = accelerating |
| `sourceDiversity` | int | Number of distinct sources/outlets |
| `topSources` | array | Top 3 sources by mention volume |

### Sentiment Data
| Field | Type | Description |
|---|---|---|
| `sentiment` | string | "bullish" / "bearish" / "neutral" |
| `sentimentScore` | float (-1 to 1) | Aggregate sentiment. Positive = bullish |
| `sentimentTrend` | string | "improving" / "declining" / "stable" |
| `aiSentiment` | string | AI-generated sentiment assessment |
| `socialSentiment` | object | Per-platform breakdown (Twitter, Reddit, Telegram) |
| `fearGreedIndex` | int (0-100) | Market-wide Fear & Greed value |

### Narrative Data
| Field | Type | Description |
|---|---|---|
| `narrativeClassification` | string | "AI", "meme", "DeFi", "regulatory", "macro", etc. |
| `narrativeStrength` | float (0-1) | Multi-source confirmation score |
| `catalystDetected` | boolean | Whether a specific catalyst/event was identified |
| `catalystSummary` | string | One-line description of catalyst (if detected) |
| `originalSource` | string | Traced origin of the narrative |
| `multiSourceConfirmation` | boolean | Same story from 3+ independent sources |

### Trending Data
| Field | Type | Description |
|---|---|---|
| `trendingTopics` | array | Current trending topics with scores |
| `topicSentiment` | object | Sentiment per trending topic |
| `dominantPlatform` | string | Where the conversation is loudest |
| `trendAge` | string | How long this topic has been trending |

## Scoring

Each monitored topic/token receives a narrative score (0 to 1) measuring how strong and actionable the current narrative signal is.

**Default weights:**

| Signal | Weight | Description |
|---|---|---|
| Mention Velocity | 30% | Speed of mentions relative to baseline |
| Sentiment Strength | 25% | How bullish/bearish and how consistent |
| Source Diversity | 20% | Multiple independent sources > single echo |
| Narrative Clarity | 15% | Clear catalyst > vague "buzz" |
| Social Confirmation | 10% | Social platforms confirming news narrative |

**Score interpretation:**
- `0.80+` — Strong narrative with velocity, sentiment alignment, and multi-source confirmation
- `0.60 - 0.79` — Notable narrative activity, some signals mixed
- `0.40 - 0.59` — Moderate — mentions exist but no clear conviction
- `< 0.40` — Weak or noise-level activity

## Identity Resolution

For token-specific tracking, tokens are keyed by `chain:address` (same as other WrenOS skills). For topic tracking, topics are keyed by normalized keyword strings.

## Output Format

### Narrative Alert (pushed to Telegram)

When a topic/token crosses alert thresholds:

```
📰 NARRATIVE ALERT — AI Agent Tokens

Mentions: 147/hour (3.2x baseline)
Sentiment: bullish (0.72)
Sources: 8 independent outlets
Catalyst: "OpenClaw releases multi-agent framework"
Narrative Score: 0.85

Top tokens mentioned: AGNT, CLAW, AGEN
Social: Twitter leading (68%), Reddit confirming
Trend age: 4 hours (accelerating)
```

### Sentiment Shift Alert

```
⚠️ SENTIMENT SHIFT — WOJAK

Sentiment: bullish → bearish (was 0.61, now -0.23)
Trigger: 3 negative stories in 2 hours
Mentions: stable (no velocity spike)
Narrative Score: 0.42 (declining)

Context: Whale alert — large holder sold 12% of supply
```

### Fear & Greed Alert

```
😨 FEAR & GREED — Extreme Fear (19)

Index: 19 (was 34 yesterday)
Trend: declining 3 consecutive days
Market context: BTC -8% 24h, liquidations $340M

AI Brief: "Broad risk-off driven by macro uncertainty 
  and cascading liquidations. No crypto-specific catalyst."
```

### Output File (handoff format)

Written to the agent's `inbox/` directory for downstream skill consumption.

```json
{
  "ts": "2026-03-10T08:00:00.000Z",
  "type": "crypto-news-scanner",
  "monitoringMode": "topic_watch",
  "alerts": [
    {
      "topic": "AI agent tokens",
      "narrativeScore": 0.85,
      "mentions": {
        "count1h": 147,
        "velocity": 147.0,
        "velocityChange": 3.2,
        "sourceDiversity": 8
      },
      "sentiment": {
        "score": 0.72,
        "label": "bullish",
        "trend": "improving",
        "socialBreakdown": {
          "twitter": 0.78,
          "reddit": 0.65,
          "telegram": 0.70
        }
      },
      "narrative": {
        "classification": "AI",
        "catalystDetected": true,
        "catalystSummary": "OpenClaw releases multi-agent framework",
        "multiSourceConfirmation": true,
        "originalSource": "techcrunch.com"
      },
      "relatedTokens": ["AGNT", "CLAW", "AGEN"],
      "evidence": "147 mentions/hr (3.2x baseline), 8 sources, bullish sentiment, clear catalyst",
      "trendAge": "4h"
    }
  ],
  "marketContext": {
    "fearGreedIndex": 62,
    "fearGreedLabel": "greed",
    "btcDominance": 52.3
  },
  "feed_health": {
    "cryptoNewsLite": "ok",
    "agentiSocial": "ok",
    "lunarcrush": "not_configured"
  },
  "config": {
    "activeSources": ["crypto_news_lite", "agenti_social"],
    "topics": ["AI agent tokens"],
    "velocityThreshold": 2.0,
    "sentimentShiftThreshold": 0.4,
    "minSourceDiversity": 3,
    "scanIntervalMins": 15
  }
}
```

**Output location:** `inbox/news-scanner-{timestamp}.json`

### Heartbeat Compatibility

The `feed_health` block is readable by the heartbeat supervisor agent. If crypto-news-lite goes down, the supervisor will see the degradation during its check cycle.

## User Configuration

All parameters are configurable through Telegram conversation.

### Configurable Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| `topics` | [] | array of strings | Topics/keywords to track |
| `tokens` | [] | array of symbols/addresses | Tokens to track sentiment for |
| `velocityThreshold` | 2.0 | 1.0 - 10.0 | Velocity multiplier vs baseline to trigger alert |
| `sentimentShiftThreshold` | 0.4 | 0.2 - 0.8 | Minimum sentiment score change to trigger alert |
| `minSourceDiversity` | 3 | 1 - 10 | Minimum distinct sources for narrative confirmation |
| `fearGreedAlertBelow` | null | 0 - 100 | Alert when Fear & Greed drops below this |
| `fearGreedAlertAbove` | null | 0 - 100 | Alert when Fear & Greed rises above this |
| `scanIntervalMins` | 15 | 5 - 60 | How often to scan for updates |
| `monitoringMode` | "topic_watch" | see modes | Default monitoring approach |
| `enableBreakingNews` | true | true/false | Include breaking news alerts |
| `enableSentimentShift` | true | true/false | Alert on sentiment reversals |
| `maxAlertsPerHour` | 5 | 1 - 20 | Rate limit on Telegram alerts |
| `narrativeScoreWeights` | (see defaults) | must sum to 1.0 | Per-signal weights |

### Example Conversations

**Getting started:**
```
User: "Track AI agent tokens for me"
Agent: "Tracking 'AI agent tokens' — scanning news and social 
        every 15 minutes. I'll alert you when mention velocity 
        hits 2x baseline or sentiment shifts significantly."
```

**Adding tokens:**
```
User: "Also track sentiment for WOJAK and BONK"
Agent: "Added WOJAK and BONK to token sentiment tracking. 
        I'll alert on mention spikes and sentiment reversals 
        for both."
```

**On-demand snapshot:**
```
User: "What's trending in crypto right now?"
Agent: "Top trending topics:
        1. AI agents — 312 mentions/hr, bullish (0.74)
        2. Solana DeFi — 198 mentions/hr, neutral (0.12)
        3. ETH staking — 145 mentions/hr, bullish (0.58)
        Fear & Greed: 62 (Greed)
        Market brief: 'Risk-on sentiment driven by AI 
        narrative and Solana ecosystem growth.'"
```

**Regulatory watch:**
```
User: "Watch for any SEC news about crypto"
Agent: "Regulatory watch active for SEC + crypto keywords. 
        Scanning regulatory feed every 15 minutes."
```

**Fear & Greed:**
```
User: "Alert me when Fear & Greed drops below 25 or above 80"
Agent: "Fear & Greed alerts set: below 25 (extreme fear) and 
        above 80 (extreme greed). Currently at 62."
```

**Digging deeper:**
```
User: "Where did this AI agent narrative start?"
Agent: [traces original sources]
       "Earliest source: TechCrunch article 6 hours ago about 
        OpenClaw's multi-agent release. Picked up by CoinDesk 
        (4h ago), then The Block (3h ago). Twitter amplification 
        started ~3 hours ago, now at 147 mentions/hr."
```

## Scheduling

The scanner runs on a configurable cron interval:

```bash
openclaw cron create --name "news-scanner" \
  --expression "*/15 * * * *" \
  --mandate "Run crypto-news-scanner with current user config. 
             Check tracked topics and tokens. 
             Alert on velocity spikes, sentiment shifts, 
             and breaking news."
```

Each scan cycle produces:
1. Updated scanner JSON in `inbox/` (overwritten each cycle)
2. Telegram alert if any tracked topic/token crosses thresholds
3. Breaking news alert if enabled and relevant story detected
4. Fear & Greed alert if threshold crossed

**Alert deduplication:** Each story/topic only triggers one alert per threshold crossing. Dedup cache stored at `memory/news-scanner-dedup.json`, persists across cron invocations, 24h expiry.

## Requirements

### MCP Servers

**Required:**
```json
{
  "crypto-news-lite": {
    "command": "node",
    "args": ["vendor/crypto-news-lite/mcp/index.js"]
  }
}
```

crypto-news-lite (`free-crypto-news` under the hood) provides 49 tools covering news, social sentiment, market data, whale alerts, AI analysis, and more. No API key required — it uses the free API at cryptocurrency.cv.

**Recommended (richer social data):**
```json
{
  "agenti-lite": {
    "command": "node",
    "args": ["vendor/agenti-lite/dist/index.js"]
  }
}
```

agenti-lite adds its own social and news modules for broader coverage. Also no API key required.

### API Keys

| Key | Enables | Required |
|---|---|---|
| (none) | Full news + social + sentiment via crypto-news-lite | Yes (no key needed) |
| (none) | Additional social data via agenti-lite | No key needed |
| `LUNARCRUSH_API_KEY` | Enhanced per-token social metrics (galaxy score, engagement depth) | Optional |

**This skill works with zero API keys.** crypto-news-lite's 49 tools cover news, social sentiment, AI analysis, market data, and more — all free. LunarCrush adds per-token depth but is not required and has incomplete coverage for small meme tokens.

### WrenOS Components (included)

- `vendor/crypto-news-lite/` — 49-tool news, social, and market intelligence MCP server (free-crypto-news)
- `vendor/agenti-lite/` — additional social and news modules (universal-crypto-mcp)
- `packs/meme-discovery-pack/` — pack config and handoff schema

## Feed Health

The skill monitors data source status on each scan cycle.

**Status values:**
- `ok` — responded with valid data
- `degraded` — responded but incomplete or slow
- `error` — failed to respond
- `not_configured` — MCP server not set up

**Primary feed failure (crypto-news-lite down):**
- Scanning paused
- User notified in Telegram
- Last scanner output remains (marked stale)
- Auto-retry on next cron tick

**Enrichment feed failure (agenti-lite social or LunarCrush down):**
- Scanning continues with crypto-news-lite data
- Social coverage may be less comprehensive — noted in output

## Privacy

- No prompt or completion content is logged
- No data sent beyond configured MCP servers
- Topic/keyword queries logged for debugging (can be disabled)
- Inference routes through Speakeasy when configured

## Error Handling

| Error | Action |
|---|---|
| crypto-news-lite not installed | Guide user through setup |
| crypto-news-lite API down | Retry next cron tick, notify user if 3+ consecutive failures |
| agenti-lite social module error | Skip supplementary social, continue with crypto-news-lite |
| LunarCrush 401/429 | Skip enrichment, continue |
| No topics configured | Prompt user to add topics or tokens |
| Telegram notification fails | Log error, retry next alert |

## Data Retention

- Scanner output file: overwritten each scan cycle (latest state only)
- Alert dedup cache: 24 hours (entries older than 24h pruned each cycle)
- Feed health logs: 7 days
- Each scan is stateless beyond dedup cache
- All files excluded from git

## Relationship to Other Skills

### Upstream: none (primary intelligence source)
The news scanner is an independent intelligence feed. It doesn't consume output from other skills.

### Downstream: solana-token-discovery, token-deep-dive
Narrative signals can inform discovery — if the scanner detects a narrative spike for a token category, the discovery skill can prioritize those tokens. Deep dive uses narrative data as one of its dimensions.

### Parallel: pump-fun-monitor, heartbeat-monitor
The scanner tracks market-level narrative. Pump-fun-monitor tracks token-level graduation events. Heartbeat supervisor reads both feed health outputs. No overlap in function.

## What This Skill Does NOT Do

- **Does not discover tokens.** It tracks narratives and sentiment. Use solana-token-discovery for token scanning.
- **Does not trade.** It provides narrative intelligence. Trading is handled by separate skills.
- **Does not analyze on-chain data.** It tracks what people are saying, not what wallets are doing (use token-deep-dive for on-chain analysis).
- **Does not require any API keys.** Works out of the box with crypto-news-lite.

## Compatibility

- **WrenOS:** v0.1.0+
- **OpenClaw:** 2026.3.2+
- **Agent Skills standard:** compatible
- **Downstream:** solana-token-discovery, token-deep-dive, strategy-builder, or any skill reading scanner output
- **Heartbeat-aware:** feed_health output readable by heartbeat supervisor agent

## Installation

### Via WrenOS CLI
```bash
wrenos init-pack --pack meme-discovery
```

The meme-discovery pack includes solana-token-discovery, pump-fun-monitor, token-deep-dive, and crypto-news-scanner.

### Via ClawHub
```bash
clawhub install crypto-news-scanner
```

### Manual
1. Copy this SKILL.md to your agent's skills directory
2. Install `vendor/crypto-news-lite`
3. Configure `.mcp.json` with crypto-news-lite MCP server
4. (Optional) Add agenti-lite for supplementary social data
5. (Optional) Set `LUNARCRUSH_API_KEY` for enhanced per-token social metrics
6. Tell your agent: "Track AI agent tokens for me"
