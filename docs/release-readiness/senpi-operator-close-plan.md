# Senpi Benchmark Delta Close-Plan (Operator-Facing) — WRE-130

Date: 2026-03-20
Scope: Operator-critical parity only. Separate true v1 launch blockers from v1.1 improvements.

## Delta matrix (WrenOS vs Senpi, operator-critical flows)

| Flow | Current WrenOS state | Senpi comparison delta | Operator impact | Decision |
|---|---|---|---|---|
| First successful run path | Strong docs coverage, but path is spread across quickstart/docs sections | Senpi presents a tighter linear flow | Medium: slower first success for new operator | **Ship now** with current path, continue docs IA refinement in v1.1 |
| Pre-launch safety gating | v1 checklist + validation scripts now present | Similar guardrails posture | Low: gates exist and are actionable | **Ship now** |
| Docs freshness confidence | Provenance marker + drift detector now in CI | Comparable trust signals | Low: stale docs risk reduced materially | **Ship now** |
| Site/docs regression confidence | Regression harness + CI checks + screenshot artifacts | Comparable quality gate | Low: reduced accidental break risk | **Ship now** |
| Baseline cleanup issue lifecycle | One stale run-lock issue (WRE-115) remains administratively stuck | Senpi does not expose this issue model | Medium process friction, low product risk | **Defer to v1.1** with platform-side run-lock cleanup |
| Benchmark communication clarity | Existing delta report present, but close-plan needed explicit ship/defer calls | Senpi messaging is concise | Medium for stakeholder alignment | **Ship now** via this close-plan artifact |

## Prioritized close-plan

### True v1 launch blockers (must be green)
1. **No product-surface blockers identified** in this benchmark delta review.
2. Existing launch gates to maintain as mandatory:
   - `docs/release-readiness/v1-checklist.md`
   - `npm run docs:drift`
   - site regression harness checks

### v1.1 planned deltas (defer with rationale)
1. **Issue lifecycle lock recovery (WRE-115)**
   - Rationale: process-plane blocker, not user-facing product risk.
   - Target: add platform-safe recovery path for stale `executionRunId` + null `checkoutRunId` lock state.
2. **Operator onboarding compression**
   - Rationale: current flow works but can be more linear and faster for first success.
   - Target: single guided path + reduced context switching between docs pages.

## Explicit decisions

### Ship now
- v1 release-readiness gates and objective criteria
- docs provenance marker + drift detection automation
- site/docs regression harness and CI enforcement
- benchmark delta visibility with clear operator-facing plan (this artifact)

### Defer (v1.1)
- run-lock conflict remediation path for stuck in-progress issue metadata
- additional UX compression/polish beyond current operator-journey baseline

## Concrete next actions tied to issues
- **WRE-105**: keep launch checklist as final decision gate reference (done/merged expected)
- **WRE-110**: enforce docs drift integrity continuously (done/merged expected)
- **WRE-114**: keep regression harness active for content updates (done/merged expected)
- **WRE-113**: continue IA refinement iterations as v1.1 docs polish
- **WRE-115**: resolve stale run-lock via platform-side ownership cleanup path

## Acceptance mapping
- Crisp delta matrix on operator-critical flows ✅
- Prioritized close-plan for v1 blockers vs v1.1 ✅
- Explicit ship/defer decisions with rationale ✅
- Concrete next actions tied to issues ✅
