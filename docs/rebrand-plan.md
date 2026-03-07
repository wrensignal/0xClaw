# Rebrand execution plan: 0xClaw → WrenOS

## Objective

Make WrenOS the dominant and consistent product identity across repo, CLI, docs, config paths, and package metadata while preserving continuity.

## Principles

1. WrenOS is primary user-facing name
2. explicit compatibility layer for migration
3. no hidden breaking changes
4. visible migration docs
5. no half-rebranded UX

## Canonical naming system (authoritative)

- **Product name:** `WrenOS`
- **Repository name:** `WrenOS`
- **CLI command (primary):** `wrenos`
- **CLI command (compatibility alias):** `0xclaw` (temporary)
- **Hidden config directory (primary):** `.wrenos/`
- **Hidden config directory (legacy fallback):** `.0xclaw/` (read-only compatibility window)
- **Generated config files (primary):**
  - `.wrenos/config.json`
  - `.wrenos/pack-*.json`
- **Generated template path (primary):** `.wrenos/wrenos-templates/`
- **Template activation targets (primary):**
  - `.wrenos/AGENTS.md`
  - `.wrenos/HEARTBEAT.md`

### Documentation terminology rules

Use these terms consistently in user-facing docs:
- **WrenOS**
- **WrenOS CLI**
- **WrenOS profiles**
- **WrenOS packs**
- **WrenOS control plane**

Do not present `0xClaw` as the primary product identity after this phase.
Use `0xClaw` only in explicit migration/compatibility context.

## Workstreams

### 1) Naming surface
- root package renamed to `wrenos`
- CLI bin exposes `wrenos` primary + `0xclaw` alias
- internal package scope shifted from `@0xclaw/*` to `@wrenos/*`

### 2) Config + command migration
- primary config path switched to `.wrenos/`
- legacy fallback support for `.0xclaw/config.json`
- `bootstrap-wrenos` primary command + legacy alias support

### 3) Trust + maturity uplift
- real root scripts (`build`, `test`, `lint`, `typecheck`)
- clear status messaging for usable/experimental/planned
- concrete happy-path example with audit log output

### 4) Documentation
- README rewritten around WrenOS positioning
- migration guide added (`docs/migration-0xclaw-to-wrenos.md`)
- quickstart and safety docs aligned with new naming

## Validation checklist

- [ ] `npm run build`
- [ ] `npm run test`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `wrenos init && wrenos status`
- [ ] legacy path fallback test (`.0xclaw/config.json`)
