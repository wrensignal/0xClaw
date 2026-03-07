# Migrating from 0xClaw to WrenOS

This guide explains how to migrate from `0xClaw` naming to `WrenOS` with minimal disruption.

## Why the rename happened

The project has matured from an early compatibility/bootstrap kit into a broader operator control plane.

`WrenOS` better reflects the actual product scope:
- inspectable control plane
- evidence-first operator workflow
- paper-first safety posture
- OpenClaw-compatible deployment model

## What changed

### Repository rename
- Old: `wrensignal/0xClaw`
- New: `wrensignal/wrenOS`

### CLI rename
- Old primary command: `0xclaw`
- New primary command: `wrenos`

### Config directory rename
- Old: `.0xclaw/`
- New: `.wrenos/`

### Command surface updates
- Primary bootstrap command: `wrenos bootstrap-wrenos`
- Legacy alias still accepted: `wrenos bootstrap-openclaw` (deprecated)
- Migration command added: `wrenos migrate`

### Package naming updates
- Internal workspace scope moved to `@wrenos/*`
- `speakeasy-ai` package name intentionally unchanged for compatibility stability

## Compatibility aliases (temporary migration window)

Supported today:
- `0xclaw` command alias (prints deprecation warning)
- `.0xclaw/config.json` fallback read path (prints migration warning)
- `bootstrap-openclaw` command alias (prints deprecation warning)
- `upgrade-config` alias for migration (prints deprecation warning)

These aliases are temporary and planned for removal in **v0.3.0**.

## Manual migration steps

```bash
# from repo root
mkdir -p .wrenos
cp .0xclaw/config.json .wrenos/config.json

# optional: migrate pack/template artifacts manually if present
cp .0xclaw/pack-*.json .wrenos/ 2>/dev/null || true
cp -R .0xclaw/openclaw-templates .wrenos/wrenos-templates 2>/dev/null || true

# validate
wrenos doctor
wrenos status
```

## Automatic migration (recommended)

```bash
# non-destructive: skips existing .wrenos files
wrenos migrate

# overwrite existing .wrenos files
wrenos migrate --force
```

`wrenos migrate` performs post-copy validation and reports:
- copied files
- skipped files
- config validation status

## Old vs new usage examples

| Before | After |
|---|---|
| `0xclaw init --profile research-agent` | `wrenos init --profile research-agent` |
| `0xclaw doctor` | `wrenos doctor` |
| `0xclaw status` | `wrenos status` |
| `0xclaw bootstrap-openclaw` | `wrenos bootstrap-wrenos` |
| `.0xclaw/config.json` | `.wrenos/config.json` |

## What stayed the same

Conceptually, the system remains the same:
- safe-by-default
- paper-first execution posture
- profile/pack-driven operator config
- OpenClaw-compatible runtime integration
- inspectable, file-based control-plane workflow
