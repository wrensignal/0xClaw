# Senpi Benchmark Delta Report (WRE-112)

Date: 2026-03-20
Scope: Convert benchmark deltas into implementable WrenOS parity work with impact/effort scoring.

## Scoring model
- Impact: 1 (low) to 5 (high)
- Effort: 1 (small) to 5 (large)
- Priority score = Impact / Effort (higher is better)

## Parity dashboard

| Area | Current WrenOS delta vs Senpi | Proposed action | Impact | Effort | Priority | Backlog link |
|---|---|---|---:|---:|---:|---|
| Onboarding speed | Requires more manual verification steps before first useful run | Add guided “first 10 minutes” fast path checklist + auto-validation prompt flow | 5 | 2 | 2.5 | WRE-113 |
| Deploy UX | Operator deploy sequence still split across docs/tooling | Consolidate deploy runbook and add preflight/rollback command grouping | 5 | 3 | 1.67 | WRE-105 |
| Docs clarity | Strong depth, but discoverability and narrative path still dense | Rework docs IA for linear operator journey and progressive disclosure | 4 | 2 | 2.0 | WRE-113 |
| Skill packaging | Skills are flexible but packaging story is less opinionated for defaults | Publish “recommended starter pack” and stable package contract expectations | 4 | 3 | 1.33 | WRE-123 |
| Telemetry visibility | Artifact generation exists, but top-level dashboarding is less immediate | Add release-readiness telemetry summary and drift indicators in docs reports | 4 | 2 | 2.0 | WRE-110 |

## Actionable close-plan

### 1) High-priority (execute first)
1. **WRE-113 (Docs IA cleanup)**
   - Target: reduce time-to-first-successful-run by clarifying operator flow.
   - Exit: operator can complete setup path without cross-referencing >2 sections.
2. **WRE-110 (Docs provenance + drift automation)**
   - Target: eliminate silent staleness and increase trust in docs freshness.
   - Exit: strict drift check in CI + visible synced commit marker.
3. **WRE-105 (Release readiness checklist)**
   - Target: objective go/no-go launch gate.
   - Exit: all Critical/High gates green with evidence links.

### 2) Medium-priority
4. **WRE-123 (Managed contract matrix + CI gate)**
   - Target: lock managed lane behavior and avoid regressions.
   - Exit: required contract gate and exhaustive matrix pass on CI.

## Defers (with rationale)
- **Advanced UX polish parity**: defer to post-v1; does not block safe/operable launch.
- **Deep hosted workflow mimicry**: defer; v1 prioritizes operator-managed clarity over hosted convenience parity.

## Success criteria for this report
- Deltas mapped to implementable tasks ✅
- Impact/effort scoring present ✅
- Backlog links included ✅
- v1 parity dashboard produced ✅
