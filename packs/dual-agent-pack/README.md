# Dual Agent Pack (Neutral)

This pack provides a bare-bones two-agent operating model for OpenClaw:

- `research-agent` — signal gathering + evidence briefs
- `trading-agent` — strategy testing + regression/risk gates

No orchestrator persona is included. Operators can define their own top-level controller.

## Included

- `research-agent/AGENTS.md`
- `research-agent/HEARTBEAT.md`
- `trading-agent/AGENTS.md`
- `trading-agent/HEARTBEAT.md`
- `handoff/research-brief.schema.json`

## Handoff contract

Research agent writes briefs matching `handoff/research-brief.schema.json`.
Trading agent consumes briefs from an inbox pattern like:

`inbox/research-*.json`

## Safety defaults

- Live trading disabled by default
- Explicit approval required for external side effects
- Data-quality fallback tiers required
