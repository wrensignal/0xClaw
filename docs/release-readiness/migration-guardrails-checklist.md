# WRE-104 Migration Guardrails Checklist (legacy → WrenOS)

Date: 2026-03-19

## Goal
Make migration safe and predictable during the compatibility window.

## Required guardrails

- [x] Legacy command alias (`legacy`) still works and prints deprecation notice
- [x] Legacy config fallback (`.legacy/config.json`) still works and prints migration warning
- [x] Explicit migrate path (`wrenos migrate`) exists and is safe when no legacy dir exists
- [x] Compatibility docs explicitly describe temporary aliases and removal target
- [x] Stale/non-canonical migration references are pointed to canonical guide

## Runtime checks added

From test suite (`packages/cli/test/smoke.test.mjs`):
- `legacy config fallback emits migration warning in status`
- `legacy compatibility alias emits deprecation warning`
- `migrate no-ops safely when no legacy directory exists`

## Canonical migration docs

- Primary: `docs/migrating-from-legacy-to-wrenos.md`
- Legacy pointer retained intentionally: `docs/migration-legacy-to-wrenos.md`

## Expected outputs (operator-facing)

1) Legacy alias invocation:
- stderr should include deprecation warning and migration guidance.

2) Legacy config fallback:
- stderr should include warning about `.legacy` path usage.
- `wrenos status` output should expose `operatorInterface.configFormat = "legacy-compat"`.

3) No-legacy migrate:
- stdout should include: `No legacy .legacy directory found. Nothing to migrate.`

## Confusion-prone stale references handled

- Migration guidance points to canonical doc path.
- Compatibility behavior is documented as temporary and explicit.
- Non-migration pages should avoid accidental legacy-first wording.
