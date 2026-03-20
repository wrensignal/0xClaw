# Rebrand Audit — `legacy` → `WrenOS`

Date: 2026-03-07
Scope: entire repository (excluding `.git/` and `node_modules/`)

## Method

Searched for these terms across all files:
- `legacy`
- `legacy`
- `.legacy`
- `openclaw`
- `bootstrap-openclaw`
- `claw` (broad derivative scan)

Notes:
- Broad `claw` scan includes false positives like `clawback` (Jupiter/integration docs). Those are marked as **no action**.
- `OpenClaw` references are often intentional platform references (product dependency), not old brand leakage.

---

## 1) Hard technical identifiers

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `package.json` | `"legacy": "packages/cli/src/index.mjs"` | CLI bin alias | Keep as temporary compatibility alias; remove in future major |
| `packages/cli/package.json` | `"legacy": "src/index.mjs"` | CLI bin alias | Keep as temporary compatibility alias; remove in future major |
| `package-lock.json` | `"legacy"` bin entries | lockfile technical residue | Keep (auto-generated); will clear when alias removed |
| `packages/cli/src/index.mjs` | `legacyConfigDir = '.legacy'` | Legacy config path support | Keep during migration window |
| `packages/cli/src/index.mjs` | `configFormat: 'legacy-legacy'` | Runtime compatibility marker | Keep during migration window |
| `packages/cli/src/index.mjs` | `case 'bootstrap-openclaw'` | Legacy command alias | Keep during migration window |

---

## 2) User-facing product naming remnants

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `README.md` | "previously branded `legacy`" | Migration/product note | Keep (intentional transparency) |
| `README.md` | "`legacy` CLI + `.legacy/` config" | Compatibility note | Keep until deprecation date published |
| `docs/quickstart.md` | "coming from `legacy`" | Migration UX copy | Keep |
| `docs/migration-legacy-to-wrenos.md` | multiple `legacy`/`legacy` references | Migration doc | Keep (this file is explicitly migration-focused) |

---

## 3) Compatibility references (intentional)

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `.gitignore` | `.legacy/` | Legacy workspace path | Keep while fallback supported |
| `README.md` | `.legacy/config.json` fallback | Compatibility behavior | Keep |
| `packages/cli/src/index.mjs` | warning: using `.legacy/config.json` | Compatibility runtime messaging | Keep |
| `docs/rebrand-plan.md` | references to `legacy` alias and `.legacy` | Rebrand planning doc | Keep |

---

## 4) OpenClaw platform references (not old-brand leakage)

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `README.md` | "for OpenClaw" | Platform dependency | Keep |
| `docs/architecture.md` | OpenClaw deployment mentions | Platform dependency | Keep |
| `docs/telegram-integration.md` | OpenClaw Telegram routing mentions | Platform dependency | Keep |
| `RAILWAY_DEPLOY.md` | `OPENCLAW_API_KEY` + OpenClaw routing | Env/API integration | Keep |
| `railway.json` | `OPENCLAW_API_KEY` | Required env var key | Keep |
| `scripts/install.sh` | "WrenOS/OpenClaw operators" text | Operator guidance | Keep |
| `packs/dual-agent-pack/README.md` | OpenClaw operating model mention | Product context | Keep |
| `examples/wrenos-research-only/README.md` | WrenOS example naming | Example naming | No action |
| `examples/wrenos-solo-trader/README.md` | WrenOS example naming | Example naming | No action |

---

## 5) Docs-only references

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `docs/rebrand-plan.md` | historical `legacy` references | Planning documentation | Keep |
| `docs/migration-legacy-to-wrenos.md` | historical `legacy` references | Migration documentation | Keep |
| `packages/speakeasy-ai/PUBLISH_SPEAKEASY_AI.md` | legacy local project path | Maintainer local doc path | Update to neutral path (`<repo-root>`) |

---

## 6) Code comments / dead strings

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `packages/cli/src/index.mjs` | function name `cmdBootstrapOpenclaw` | Internal function name | Optional: rename to `cmdBootstrapWrenos` (no behavior change) |
| `packages/cli/test/smoke.test.mjs` | temp dir prefix `legacy-cli-smoke-` | Test-only string | Optional: rename to `wrenos-cli-smoke-` |

---

## 7) File paths / filenames

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `docs/migration-legacy-to-wrenos.md` | filename includes `legacy` | Migration artifact | Keep (clear + explicit) |
| `examples/wrenos-research-only/` | folder name uses WrenOS naming | Example path naming | No action |
| `examples/wrenos-solo-trader/` | folder name uses WrenOS naming | Example path naming | No action |

---

## 8) URLs / repo coordinates

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `packages/speakeasy-ai/PUBLISH_SPEAKEASY_AI.md` | local filesystem path with `/legacy/` | Local doc path | Update to relative/neutral path |
| `railway.json` | `github:wrensignal/wrenOS` | New branding URL | No action |

---

## 9) Command names

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `packages/cli/src/index.mjs` | `bootstrap-openclaw` | Legacy command alias | Keep temporarily |
| `package.json`, `packages/cli/package.json` | `legacy` bin | Legacy command alias | Keep temporarily |

---

## 10) Package metadata

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `package-lock.json` | lockfile entries referencing `legacy` bin alias | Generated metadata | Keep while alias exists |
| workspace package scopes | prior `@legacy/*` (already migrated) | Package namespace | No further action |

---

## 11) Vendor / third-party content (broad `claw` scan)

| File path | Old reference | Type | Recommended action |
|---|---|---|---|
| `vendor/skills/**` | many `openclaw` metadata keys and docs | Vendored upstream compatibility metadata | No action unless vendor fork policy requires rewrite |
| `vendor/pump-fun-sdk-lite/**` | `clawhub`, `clawback` terms | External ecosystem terminology | No action (not brand leakage) |
| `scripts/publish-clawhub-speakeasy.sh` | `clawhub` naming | External service name | No action |

---

## Summary

### Keep (intentional)
- `OpenClaw` platform references
- Migration references to `legacy`/`legacy`
- Temporary compatibility aliases (`legacy` bin, `.legacy` fallback, `bootstrap-openclaw` alias)

### Change next (low-risk cleanup)
1. `packages/speakeasy-ai/PUBLISH_SPEAKEASY_AI.md` local path cleanup
2. Internal symbol rename: `cmdBootstrapOpenclaw` → `cmdBootstrapWrenos`
3. Optional example folder renames from `openclaw-*` to `wrenos-*`

### Defer to major-version cut
- Remove `legacy` CLI alias
- Remove `.legacy` fallback
- Remove `bootstrap-openclaw` alias
- Regenerate lockfile without legacy alias entries
