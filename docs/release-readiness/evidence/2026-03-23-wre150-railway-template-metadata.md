# WRE-150 Railway template metadata + referral validation

Date: 2026-03-23
Issue: WRE-150

## Published slug and referral URL

- Slug: `https://railway.com/deploy/wrenos`
- Referral URL (README canonical):
  - `https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme`

## Template metadata sections (operator-facing copy)

- Overview: WrenOS hosted quickstart with paper-first defaults
- First-run contract: docs + preflight + health flow
- Required env set and sensitive key guidance
- Security posture (paper default, no implicit live-execution)
- Verification checklist and troubleshooting guidance

These sections are documented in:
- `RAILWAY_DEPLOY.md`
- `README.md` (deploy CTA)

## Referral/deploy flow validation

Validation actions performed:
1. Opened deploy URL in OpenClaw browser:
   - `https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme`
2. Confirmed active tab title + URL correspond to deploy slug flow.
3. Captured screenshot evidence and tab snapshot logs.

Artifacts:
- `docs/release-readiness/evidence/2026-03-23-wre150-browser-tabs.txt`
- `docs/release-readiness/evidence/2026-03-23-wre150-browser-screenshot.txt`

## Notes

Draft deployment execution in Railway workspace is account/session-dependent.
This evidence confirms routing into the correct deploy slug flow with referral params and ready-to-deploy page context.
