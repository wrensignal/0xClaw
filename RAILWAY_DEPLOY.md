# WrenOS Production-Grade Railway Deploy Wrapper

This guide defines a production-oriented Railway onboarding flow for WrenOS.

## 1) Template Scope

- Template source: `railway.json`
- Service target: single `agent` service (expand to multi-service later if needed)
- Deploy URL (after publish): `https://railway.com/deploy/wrenos`
- Referral URL (README canonical): `https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme`

## 2) First-Run Onboarding Flow

On first deploy, use this order:

1. Set base env vars (profile, auth, inference, Telegram)
2. Deploy service
3. Confirm startup health in logs
4. Run bootstrap sanity checks:
   - profile resolved
   - `.wrenos/` config path healthy
   - MCP starter wiring present/expected
5. Verify operator channel wiring (Telegram)
6. Keep execution in paper-safe mode until explicit operator approval

Recommended first profile: `research-agent`.

## 3) Environment Variables

### Required
- `PROFILE` (default `research-agent`)
- `OPENCLAW_API_KEY` (sensitive)
- `TELEGRAM_BOT_TOKEN` (sensitive)

### Common
- `SPEAKEASY_BASE_URL` (default `https://api.speakeasyrelay.com`)
- `SPEAKEASY_API_KEY` (optional, sensitive)
- `TELEGRAM_CHAT_ALLOWLIST` (optional)
- `WORKSPACE_DIR` (default `/app`)
- `WRENOS_BOOTSTRAP_ON_START` (default `true`)

### Conditional
- `AGENT_WALLET_PRIVATE_KEY` (only if execution-enabled paths are used)
- `OPENCLAW_GATEWAY_BASE_URL` (optional proxy/gateway override)
- `RAILWAY_PUBLIC_DOMAIN` (if public routing/webhook behavior is needed)

## 4) Persistence Assumptions

WrenOS depends on local workspace artifacts (`.wrenos`, `.mcp.json`, generated state/memory files).

Assume:
- container filesystem may be ephemeral across rebuilds/redeploys
- runtime memory/state should be treated as re-creatable unless mounted/persisted

Operator guidance:
- persist critical config and secrets externally
- treat generated state as cache/operational telemetry unless explicit persistence is configured

## 5) Proxy / Gateway Behavior

- OpenClaw gateway/API routing should be explicit via env (`OPENCLAW_API_KEY`, optional `OPENCLAW_GATEWAY_BASE_URL`).
- If public ingress is enabled, use Railway domain + upstream routing rules; do not expose unnecessary endpoints.
- Keep network surface minimal: only required runtime ports/routes.

## 6) Auth / Token Handling

- Keep all secrets in Railway secret env vars (never committed).
- Rotate `OPENCLAW_API_KEY` on suspected leak.
- Restrict Telegram interaction with `TELEGRAM_CHAT_ALLOWLIST` when possible.
- Avoid logging raw secrets/tokens.

## 7) Workspace Bootstrap Expectations

Bootstrap should ensure:
- profile config exists and parses
- expected control files exist (`.wrenos/config.json`, optional `.mcp.json`)
- startup does not implicitly enable live execution

If bootstrap fails:
- fail fast with actionable log messages
- do not start in partially configured live-capable state

## 8) Telegram Wiring (Operator Path)

After deploy:
1. set `TELEGRAM_BOT_TOKEN`
2. set optional `TELEGRAM_CHAT_ALLOWLIST`
3. verify command path:
   - `/status`
   - `/watchlist`
   - `/health`
   - `/heartbeat`
   - `/performance`
   - `/trade <symbol>`
   - `/paper on|off`

## 9) Security Posture

Non-negotiable defaults:
- `liveExecution: false` unless explicitly enabled by operator
- approval-gated external side effects
- conservative fallback when config/data quality is degraded
- least-privilege env and network exposure

## 10) Verification Checklist

- [ ] Service starts without crash loop
- [ ] Profile and config loaded correctly
- [ ] Inference route health check succeeds
- [ ] Telegram command interface responds
- [ ] Heartbeat/performance command hooks return structured data
- [ ] Paper mode default confirmed
- [ ] No secrets printed in logs

## 11) Troubleshooting

- **Startup config error:** confirm `PROFILE` and workspace write permissions
- **Inference failures:** verify `SPEAKEASY_BASE_URL`/egress and optional API key
- **Telegram not responding:** validate bot token and allowlist chat IDs
- **Execution/wallet errors:** confirm wallet env only when execution path is intended


## 12) v1 First-Run Contract

See `docs/railway-first-run-playbook.md` for the canonical happy path and three common failure remediations.

Use:
- `npm run railway:preflight`
- `npm run railway:first-run`
- `npm run railway:health`
