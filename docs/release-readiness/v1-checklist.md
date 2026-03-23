# WrenOS v1 Launch Checklist (Go / No-Go)

Status key: ✅ Green · ⚠️ At Risk · ❌ Red

## Launch decision rule
- **Go** only if **all Critical + High gates are ✅ Green** with evidence links populated.
- Any ❌ on Critical/High => **No-Go**.
- Medium gates may ship with explicit documented risk acceptance and follow-up owner/date.

## Gate matrix

| Gate | Severity | Owner | Evidence required | Status |
|---|---|---|---|---|
| Contract outcomes canonicalized (Q1/Q2/Q3) | Critical | Quill | Merged PR(s) + passing contract tests | ✅ WRE-121/122/123, PR #43 |
| Managed referral/routing contract validation | Critical | Quill | `node scripts/validate-managed-referral-contract.mjs` output + merged PR | ✅ WRE-141, `npm run contract:managed` passes |
| Site/docs regression harness green | High | Quill | `site-regression-report.json` + screenshot artifacts + CI run | ✅ WRE-143 |
| Docs parity + migration accuracy | High | Quill | docs parity matrix + migrated naming audit | ✅ WRE-109/111 |
| CLI smoke and profile bootstrap pass | High | Quill | `npm test` + smoke output snippets | ✅ `npm run verify` passes (2026-03-23) |
| Release notes + changelog completeness | Medium | Quill | CHANGELOG entry + release summary | ✅ WRE-146 |
| Rollback plan validated | Critical | Quill | rollback steps tested in dry-run with timestamped log | ✅ WRE-145 |
| Deployment validation (main + docs route health) | High | Quill | HTTP status checks + post-deploy screenshots | ⚠️ Authenticated Railway deploy proof pending (WRE-150/158) |

## Must-pass verification commands

```bash
npm test
node --test packages/cli/test/*.test.mjs
node scripts/validate-managed-referral-contract.mjs
```

Site/docs:

```bash
cd ../wrenos-site
./scripts/run-site-regression.sh
```

## Deploy validation checklist
1. Verify production routes: `https://wrenos.ai/` and `https://wrenos.ai/docs` return < 400.
2. Verify docs nav anchors and canonical tags are present.
3. Confirm latest intended PRs are merged to `main` in both repos.
4. Capture screenshot evidence for homepage + docs landing.

## Rollback criteria and procedure

Trigger rollback if any of:
- Critical/High gate regresses to ❌ post-deploy
- Contract validation or CLI smoke failures in production verification
- Docs/routes return 4xx/5xx unexpectedly after rollout

Rollback procedure:
1. Identify last known-good commit SHA(s) for `wrensignal/wrenOS` and `wrensignal/wrenos-site`.
2. Revert deployment pointer to previous known-good SHA(s).
3. Re-run verification commands and route checks.
4. Post incident note with root cause + prevention action.

## Evidence links section (fill before launch tag)
- WrenOS release PR: https://github.com/wrensignal/wrenOS/pull/55 (latest merged)
- wrenos-site release PR: https://github.com/wrensignal/wrenos-site/pull/8
- Contract validation evidence: WRE-121/122/123/141 (all done), `npm run contract:managed` passes
- Site regression evidence: WRE-143 (done)
- Rollback dry-run evidence: WRE-145 (done)
- Final go/no-go decision timestamp: 2026-03-23T21:35:00Z — **CONDITIONAL GO** (all Critical/High gates green except deployment validation pending authenticated Railway proof)


## Machine-checkable evidence tracker
- Sample tracker: `examples/release-readiness/v1-evidence-tracker.sample.json`
- Validate checklist + evidence schema:

```bash
npm run validate:v1-checklist
```
