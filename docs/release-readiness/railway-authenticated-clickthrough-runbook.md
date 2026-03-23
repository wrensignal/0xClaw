# Railway authenticated fresh-account clickthrough runbook

Issue: WRE-158  
Purpose: complete final hosted acceptance proof that cannot be executed in unauthenticated runtime.

## Preconditions
1. Fresh Railway account (or fresh workspace context) with valid sign-in session.
2. Canonical deploy URL:
   - `https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme`
3. Required runtime secrets prepared:
   - `PROFILE=research-agent`
   - `OPENCLAW_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - At least one inference key: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` (or `AI_API_KEY` compatibility)

## Exact clickthrough steps (record pass/fail)
1. Open canonical deploy URL.
2. Sign in with the fresh Railway account.
3. Confirm template page shows WrenOS and deploy configuration form.
4. Enter only required hosted vars listed above.
5. Trigger draft deploy.
6. Wait for draft deploy to reach healthy/running state.
7. Capture evidence screenshots:
   - env var form with required values populated (mask secrets)
   - successful draft deploy status
   - project/service overview confirming WrenOS deploy instance
8. Export/share deploy URL and project identifier.

## Acceptance criteria
- Draft deploy succeeds in authenticated session.
- No hidden extra variables required beyond documented matrix.
- Evidence artifacts attached to WRE-158 and referenced in WRE-150/WRE-152 gate docs.

## Evidence package to attach
- `authenticated-step-log.md` with numbered pass/fail steps
- `authenticated-env-form.png`
- `authenticated-deploy-success.png`
- `authenticated-project-overview.png`

## Failure handling
If deployment fails:
1. Capture exact failing step number.
2. Capture full error message text.
3. Open follow-up issue with blocker type + remediation suggestion.
4. Keep WRE-158 as blocked until successful authenticated proof exists.
