# Changelog

## 2026-03-07 — Rebrand: 0xClaw → WrenOS

### Summary

This release rebrands the project to **WrenOS** and aligns repo/package/docs/CLI surfaces with the new identity, while preserving a migration window for existing operators.

### Breaking changes

- Primary CLI command is now `wrenos`.
- Primary config directory is now `.wrenos/`.
- Internal workspace packages moved from `@0xclaw/*` to `@wrenos/*`.

### Compatibility notes

The following are still supported temporarily:
- `0xclaw` command alias (deprecated)
- `.0xclaw` config fallback (deprecated)
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
