---
name: solana-token-scan
description: "Single-entry orchestration skill for WrenOS. Takes one Solana contract address and runs token-deep-dive, whale-tracker, pump-fun-monitor, and crypto-news-scanner in one pass, then returns one consolidated report with confidence, risks, and action posture."
---

# Solana Token Scan

One command, one contract address, one report.

This skill is the umbrella scanner for a single Solana token. It orchestrates four existing skills and merges their outputs into a single operator-facing result:

- `token-deep-dive`
- `whale-tracker`
- `pump-fun-monitor`
- `crypto-news-scanner`

## Input

Required:
- Solana token mint (base58 contract address)

Optional:
- time window (`1h`, `6h`, `24h`, `7d`; default `24h`)
- strict mode (`true|false`; default `false`)
- Telegram delivery (`true|false`; default `true`)

## Invocation Examples

```
"Run a token scan for 7xQ93m..."
"Scan BONK mint 7xQ93m... with 6h window"
"Single-token report for 7xQ93m..., strict mode"
```

## Execution Plan

Given one token address, run the following in parallel when possible:

1. **token-deep-dive**
   - Pulls smart money, DEX market state, holder structure, social sentiment, news context, bonding-curve state, and trade-level checks.
2. **whale-tracker**
   - Detects accumulation/distribution by large wallets and exchange-flow context.
3. **pump-fun-monitor**
   - If token is pump.fun-related, evaluate curve progress, graduation status, and creator behavior.
4. **crypto-news-scanner**
   - Pull latest mention velocity, sentiment drift, and narrative/catalyst tags for this token.

If any sub-skill is unavailable, continue and degrade confidence; do not fail hard unless all sources fail.

## Merge Strategy

Normalize each sub-skill output into a shared envelope:

- `summary` (human-readable)
- `score` (0..1 if available)
- `signals[]`
- `risks[]`
- `feed_health[]`
- `confidence` (`high|medium|low`)

Then produce a consolidated structure:

```json
{
  "token": "<mint>",
  "window": "24h",
  "composite_score": 0.71,
  "confidence": "medium",
  "posture": "watch|paper_candidate|avoid",
  "headline": "short operator summary",
  "thesis": ["..."],
  "warnings": ["..."],
  "subskills": {
    "token_deep_dive": {"status": "ok"},
    "whale_tracker": {"status": "ok"},
    "pump_fun_monitor": {"status": "degraded"},
    "crypto_news_scanner": {"status": "ok"}
  },
  "feed_health": {
    "agenti_lite": "ok|degraded|down",
    "pump_fun_sdk_lite": "ok|degraded|down",
    "crypto_news_lite": "ok|degraded|down",
    "helius": "ok|degraded|down"
  },
  "generated_at": "ISO8601"
}
```

## Posture Rules

- `paper_candidate` when:
  - composite score >= 0.70
  - no critical safety red flags
  - at least 2 independent signal families agree (flow + liquidity, or flow + narrative)
- `watch` when:
  - score between 0.45 and 0.70
  - or data is partially degraded but still directional
- `avoid` when:
  - score < 0.45
  - or any critical red flag (extreme concentration risk, severe liquidity fragility, heavy dump behavior, contradictory manipulation signals)

Never imply live execution approval. This skill is research and prioritization output.

## Confidence Rules

- `high`: 3+ sub-skills healthy and mutually consistent
- `medium`: 2+ sub-skills healthy with minor conflicts or one degraded source
- `low`: only 1 sub-skill healthy, or significant conflicts, or multiple source outages

## Telegram Output

When delivery is enabled, send:
1. concise top-line summary (score, posture, confidence)
2. key bullish/bearish bullets
3. top 3 risks
4. data-quality status
5. optional link/path to full JSON report

## Failure Handling

- One sub-skill timeout/error: continue, mark degraded, reduce confidence
- Two sub-skills down: continue with `low` confidence and explicit warning
- All sub-skills down: return `no_decision` with actionable remediation guidance

## Safety

- No direct trading execution
- No wallet signing
- No hidden autonomous actions
- If data quality is weak, default conservative posture (`watch` or `avoid`)

## Dependencies

Primary orchestrated skills:
- `packs/core-skills-pack/token-deep-dive/SKILL.md`
- `packs/core-skills-pack/whale-tracker/SKILL.md`
- `packs/core-skills-pack/pump-fun-monitor/SKILL.md`
- `packs/core-skills-pack/crypto-news-scanner/SKILL.md`

Likely MCP/data dependencies (inherited via sub-skills):
- `vendor/agenti-lite`
- `vendor/pump-fun-sdk-lite`
- `vendor/crypto-news-lite`
- optional: Helius / LunarCrush / Birdeye

## Operator Notes

Use this skill as the first pass for a known token. If posture is `paper_candidate`, follow with deeper strategy-specific validation before any execution workflow.