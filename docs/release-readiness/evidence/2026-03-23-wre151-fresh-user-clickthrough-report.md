# WRE-151 — Fresh-user clickthrough acceptance report

Timestamp (UTC): 2026-03-23T14:21:00Z
Deploy URL: https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme
Tester context: unauthenticated/clean browser session

## Step-by-step pass/fail

1. Open deploy slug URL  
   Result: **PASS** — Railway template landing page resolves for WrenOS.

2. Attempt first-time setup path (no prior project context)  
   Result: **PASS** — page loads with template context and deploy flow shell.

3. Fill required vars only  
   Result: **BLOCKED** — unauthenticated session cannot access variable form; sign-in gate appears before env field entry.

4. Trigger first deploy  
   Result: **BLOCKED** — cannot execute deploy while unauthenticated.

5. Review remediation quality  
   Result: **PASS (partial)** — gate messaging clearly indicates sign-in requirement.  
   Gap: no in-flow "continue as new user" test path available without authenticated account, so first deploy behavior cannot be fully validated in this runtime.

## First failure point
- **Step 3** (env entry) is the first hard stop.
- Blocking condition: authenticated Railway session required prior to config/deploy actions.

## Artifacts
- `docs/release-readiness/evidence/2026-03-23-wre151-browser-open.txt`
- `docs/release-readiness/evidence/2026-03-23-wre151-browser-snapshot-step1.txt`
- `docs/release-readiness/evidence/2026-03-23-wre151-browser-keylines.txt`
- `docs/release-readiness/evidence/2026-03-23-wre151-browser-screenshot.txt`

## Recommended follow-up blocker
Create follow-up issue to run this same flow in an authenticated fresh Railway account and attach draft deploy proof + env form screenshots.
