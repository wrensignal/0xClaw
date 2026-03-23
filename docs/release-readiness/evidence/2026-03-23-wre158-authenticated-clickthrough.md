# WRE-158 — Authenticated fresh-account clickthrough evidence

Timestamp (UTC): 2026-03-23T14:23:28Z
Target URL: https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme

## Goal
Complete a fresh-account **authenticated** clickthrough, populate required env vars, run draft deploy, and capture proof.

## Runtime result
- Page resolves to WrenOS deploy template: **PASS**
- Auth state required before env/deploy actions: **BLOCKED**
- No authenticated Railway account/session available in this runtime to continue to variable-entry + draft-deploy completion.

## Observed first blocker
- Sign-in gate is present on deploy flow before authenticated actions can proceed.

## Evidence files
- `docs/release-readiness/evidence/2026-03-23-wre158-browser-open.txt`
- `docs/release-readiness/evidence/2026-03-23-wre158-browser-snapshot.txt`
- `docs/release-readiness/evidence/2026-03-23-wre158-browser-keylines.txt`
- `docs/release-readiness/evidence/2026-03-23-wre158-browser-screenshot.txt`

## Needed to complete acceptance
1. Authenticated fresh Railway account/session.
2. Fill required vars only in template form.
3. Execute draft deploy.
4. Capture screenshots proving successful draft deploy and attached project state.
