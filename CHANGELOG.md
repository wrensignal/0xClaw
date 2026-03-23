# Changelog

## 2026-03-23 — v1 Release Candidate

### Summary

This release candidate delivers the full v1 scope: hosted Railway deployment path, provider-agnostic inference, discovery mode contract, lane-split architecture, managed-lane outcome contracts, and comprehensive RC testing evidence.

### Highlights

**Hosted deployment (Railway)**
- One-click Railway deploy via canonical slug URL (#38, #46, #47, #48, #49)
- Provider-agnostic inference key support: accept any of OpenAI/Anthropic/Gemini (#46)
- Canonical hosted env variable matrix with required/optional/secret/default docs (#47)
- Discovery mode contract: explicit Basic vs Full mode reporting based on provider keys (#55)
- Railway first-run playbook, hosted quickstart, and authenticated clickthrough runbook

**Lane architecture**
- Hosted/operator env schema partition (#40)
- Docs IA split: hosted quickstart vs operator deep path (#41)
- Lane-tagged CI verification matrix with hosted + operator jobs (#42)

**Managed-lane contracts**
- Outcome engine with strict explainability validator (WRE-121)
- Managed referral funnel contract with routing verification (WRE-122)
- Exhaustive managed-lane terminal outcome matrix with CI gate (WRE-123)
- Managed-lane outcome matrix validation evidence (WRE-141, #43)

**RC testing evidence (all passed)**
- RC SHA freeze (WRE-138)
- Clean-environment verification (WRE-139)
- Fresh-machine bootstrap (WRE-140)
- Managed-lane outcome matrix (WRE-141)
- Telegram E2E integration (WRE-142)
- Site/docs journey QA (WRE-143)
- Paper-mode 24h soak (WRE-144)
- Rollback rehearsal (WRE-145)

**Infrastructure**
- Stale lock reconciliation diagnostic for Paperclip checkout conflicts (#53)
- Fix: `npm install` prepended to verify script for fresh-clone reliability (#54)
- Hosted launch gate go/no-go checklist with timestamped decision (#48)

### Known limitations
- Authenticated Railway draft deploy proof pending (WRE-150/WRE-158)
- `speakeasy-ai` package deferred from v1 (stays in repo, not promoted)

### Verification
```bash
npm run verify   # build + lint + typecheck + test + smoke + contracts
npm test         # all workspace tests pass (0 failures)
```

---

## 2026-03-07 — Rebrand: legacy → WrenOS

### Summary

This release rebrands the project to **WrenOS** and aligns repo/package/docs/CLI surfaces with the new identity, while preserving a migration window for existing operators.

### Breaking changes

- Primary CLI command is now `wrenos`.
- Primary config directory is now `.wrenos/`.
- Internal workspace packages moved from `@legacy/*` to `@wrenos/*`.

### Compatibility notes

The following are still supported temporarily:
- `legacy` command alias (deprecated)
- `.legacy` config fallback (deprecated)
- `bootstrap-openclaw` alias (deprecated)
- `upgrade-config` alias (deprecated)

All legacy aliases now print deprecation warnings with next steps.
Planned removal target for compatibility aliases: **v0.3.0**.

### Migration tips

- Use `wrenos migrate` for automatic config migration.
- Use `wrenos migrate --force` to overwrite existing `.wrenos` files.
- Validate with `wrenos doctor && wrenos status`.

### What stayed the same

- Safety posture: safe-by-default, paper-first
- Operator workflow: inspectable file-based config
- Control-plane model: profiles, packs, loops, adapters
- Compatibility model: OpenClaw-compatible runtime deployment

### Why the new naming

`WrenOS` matches what the project has become: an inspectable, operator-grade control plane for evidence-based crypto agent workflows — not just a bootstrap compatibility kit.
