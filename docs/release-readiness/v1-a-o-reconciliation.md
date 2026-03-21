# V1 Spec Reconciliation — A–O (WRE-137)

Date: 2026-03-20
Scope: Reconcile PROJECT_SPEC §4 A–O against landed work and active issue state.

## A–O mapping with proof

| Item | Status | Proof |
|---|---|---|
| A Commit/push existing work | Completed | Multiple merged PRs incl. WRE-101/103/104/122 + subsequent v1 docs/contracts tracks |
| B portfolio-optimizer skill | Completed | WRE-119 completed via PR https://github.com/wrensignal/wrenOS/pull/15 |
| C Root SKILL.md | Completed | Landed on `main` (SKILL.md present in repo root) |
| D solana-token-scan skill | Completed | Added in core-skills-pack and landed on main |
| E Speakeasy deferred from site | Completed | WRE-127 merged: https://github.com/wrensignal/wrenos-site/pull/8 |
| F Docs site maintenance | Completed (ongoing) | WRE-109/111/113/114 merged site/docs maintenance stream |
| G Naming cleanup (legacy→WrenOS) | Completed | WRE-111 merged: https://github.com/wrensignal/0xClaw-site/pull/7 and follow-up site hygiene |
| H Vendor/bootstrap wiring alignment | Completed baseline | WRE-103/WRE-104/WRE-122 streams + docs artifacts |
| I Privy wallet provisioning | Gap (v1.1) | Not yet implemented as end-to-end onboarding flow |
| J Telegram integration | Gap (v1.1) | Open issue WRE-134 |
| K Railway deploy wrapper | Gap (v1.1) | Not yet delivered as full Senpi-level wrapper |
| L Performance claims on site | Gap (v1.1) | Open issue WRE-135 |
| M WrenOS MCP server capability exposure | Completed | WRE-136 via PR https://github.com/wrensignal/wrenOS/pull/30 |
| N Profile matrix docs | Completed | `docs/profile-matrix.md` on main |
| O Bootstrap smoke/regression tests | Completed baseline | CLI/bootstrap regression tests + smoke scripts landed |

## Final v1 gap list (explicit)

1. **WRE-134** — Telegram integration (Should-Have J)
2. **WRE-135** — performance claims section on landing page (Should-Have L)
3. **Privy + Railway full-wrapper parity** (Should-Have I/K) — currently deferred to v1.1
4. **WRE-115** stale run-lock process issue — blocked by issue ownership metadata lock (process-plane)

## Issue actions
- Existing uncovered work already represented in backlog (`WRE-134`, `WRE-135`, `WRE-115`).
- No additional uncovered issue creation required in this reconciliation pass.
