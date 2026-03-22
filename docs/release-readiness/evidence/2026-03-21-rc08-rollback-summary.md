# RC Testing 08 — Executed rollback rehearsal

Timestamp UTC: 2026-03-22T02:35:33Z

Acceptance:
- rollback to known-good SHAs executed in staging-equivalent local rehearsal ✅
- post-rollback verification suite passes ✅
- restore-forward path tested ✅

SHAs:
- rollback: fe5046179af1fff08499574b58c815f8836339a9
- forward: 3edc4d848f416f429cbda790818ffb5fea62ca65

Evidence:
- 2026-03-21-rc08-rollback-rehearsal.log
- 2026-03-21-rc08-rollback-npm-test.log
- 2026-03-21-rc08-rollback-cli-test.log
- 2026-03-21-rc08-forward-npm-test.log
