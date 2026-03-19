# Site Ownership & Routing Map (wrenos.ai vs 0xClaw-site)

_Last updated: 2026-03-18_

## Goal
Remove ambiguity about production source-of-truth for WrenOS public pages.

## Deploy topology (current)

| Surface | Public URL | Runtime host | Source repo | Build/deploy ownership |
|---|---|---|---|---|
| Marketing homepage | https://wrenos.ai/ | Vercel project tied to `wrensignal/0xClaw-site` | `wrensignal/0xClaw-site` (`index.html`) | Quill/site pipeline |
| Docs page | https://wrenos.ai/docs | Vercel project tied to `wrensignal/0xClaw-site` | `wrensignal/0xClaw-site` (`docs/index.html`) | Quill/site pipeline |
| Raw Vercel preview | https://0x-claw-site.vercel.app/ | Vercel preview/prod alias | `wrensignal/0xClaw-site` | Quill/site pipeline |
| Core product code/docs | N/A (repo source of implementation truth) | GitHub | `wrensignal/wrenOS` | Quill/core pipeline |

## Authoritative source per surface

### Homepage + live docs rendering
- **Authoritative content source:** `wrensignal/0xClaw-site`
- **Canonical edit targets:**
  - homepage: `index.html`
  - docs UI page: `docs/index.html`

### Product capability truth + operator docs
- **Authoritative implementation source:** `wrensignal/wrenOS`
- **Canonical references for factual claims:**
  - CLI behavior: `packages/cli/`
  - runtime/config docs: `docs/*.md`
  - deploy contract: `RAILWAY_DEPLOY.md`, `docs/railway-first-run-playbook.md`

## Sync policy (copy/link updates)

1. **Capability changes start in `wrensignal/wrenOS` first**
   - Update code/tests/docs in core repo.
   - Merge PR.
2. **Public-site copy updates follow in `wrensignal/0xClaw-site`**
   - Reflect the merged capability truth in homepage/docs UI copy.
   - Include links back to canonical core docs where relevant.
3. **No speculative claims on site**
   - Any claim on `wrenos.ai` must map to merged code/docs in `wrensignal/wrenOS`.
4. **Naming hygiene**
   - Public-facing name is **WrenOS**.
   - `0xClaw` references only where migration-history context is explicitly intended.

## Routing/deploy map (operator quick view)

```text
wrensignal/0xClaw-site (main)
  ├─ index.html         -> https://wrenos.ai/
  ├─ docs/index.html    -> https://wrenos.ai/docs
  └─ previews           -> https://0x-claw-site.vercel.app/

wrensignal/wrenOS (main)
  ├─ packages/cli       -> canonical CLI behavior
  ├─ docs/*.md          -> canonical capability/deploy docs
  └─ NOT directly serving wrenos.ai pages
```

## PR routing rules

- Site/docs visual/content changes: PR to `wrensignal/0xClaw-site`
- Core behavior/docs contract changes: PR to `wrensignal/wrenOS`
- Cross-repo change: two PRs, with explicit cross-links in both descriptions

## Sign-off checklist

- [ ] Quill (owner) — topology map accurate
- [ ] Site pipeline owner — deploy routing confirmed
- [ ] Core pipeline owner — source-of-truth policy confirmed

Until all sign-offs are checked in issue comments, this item remains in_progress.
