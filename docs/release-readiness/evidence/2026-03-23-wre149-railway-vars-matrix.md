# WRE-149 — Railway template variable matrix (rendered mapping)

Date: 2026-03-23
Issue: WRE-149

This artifact is the canonical hosted variable mapping used by docs + preflight.

## Rendered template field mapping

| Railway field key | Required in template UI | Secret in template UI | Maps to runtime var | Notes |
|---|---:|---:|---|---|
| `PROFILE` | Yes | No | `PROFILE` | Hosted default: `research-agent` |
| `OPENCLAW_API_KEY` | Yes | Yes | `OPENCLAW_API_KEY` | Required gateway auth |
| `TELEGRAM_BOT_TOKEN` | Yes | Yes | `TELEGRAM_BOT_TOKEN` | Required operator notifications |
| `OPENAI_API_KEY` | One-of | Yes | `OPENAI_API_KEY` | One inference option |
| `ANTHROPIC_API_KEY` | One-of | Yes | `ANTHROPIC_API_KEY` | One inference option |
| `GEMINI_API_KEY` | One-of | Yes | `GEMINI_API_KEY` | One inference option |
| `AI_API_KEY` | Optional | Yes | `AI_API_KEY` | Backward-compat umbrella key |
| `WRENOS_ENABLE_EXECUTION` | Optional | No | `WRENOS_ENABLE_EXECUTION` | Default `false` |
| `AGENT_WALLET_PRIVATE_KEY` | Conditional | Yes | `AGENT_WALLET_PRIVATE_KEY` | Required only when execution enabled |

Rule enforced by preflight:
- At least one inference key must be present (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`, with `AI_API_KEY` compatibility).

## Source-of-truth docs updated in this change
- `docs/railway-first-run-playbook.md`
- `docs/quickstart.md`
- `README.md`
