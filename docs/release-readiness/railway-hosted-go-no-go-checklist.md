# Railway hosted launch gate (go/no-go) — template path

Owner: Quill  
Issue: WRE-152  
Last updated: 2026-03-23

## Objective gate checklist

| Gate | Criteria | Evidence | Status |
|---|---|---|---|
| Single-service import | Railway deploy slug resolves to template deploy flow for `wrenos` | WRE-150 evidence bundle (`2026-03-23-wre150-*`) | ✅ |
| Env validation | Hosted preflight enforces required vars + clear remediation | `scripts/railway-env-preflight.mjs`, WRE-148 tests | ✅ |
| Inference key flexibility | Any one provider key accepted (OpenAI/Anthropic/Gemini; AI_API_KEY compat) | PR #46 + `test:railway:preflight` | ✅ |
| First-run health | Documented `railway:first-run` and `railway:health` hosted sequence | `docs/railway-first-run-playbook.md` | ✅ |
| Docs parity | README + quickstart + hosted playbook aligned to canonical deploy slug and variable matrix | PR #47 + WRE-149 evidence | ✅ |
| Authenticated draft deploy proof | Successful draft deploy performed in authenticated Railway session | Pending external auth session | ❌ |

## Gate result

- **Decision:** **NO-GO (for final hosted launch gate)**
- **Reason:** final authenticated Railway draft deploy proof is not yet attached.
- **What is already green:** all non-auth product/doc/preflight gates above.

## Exit criteria to flip to GO

1. Run authenticated Railway draft deploy from canonical slug URL.
2. Capture timestamped proof artifact (screenshot + workspace/deploy state).
3. Attach artifact to WRE-150/WRE-152 and update this checklist status row.
