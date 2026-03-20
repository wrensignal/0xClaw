# Migrating from WrenOS to WrenOS

This guide explains how to migrate from `WrenOS` naming to `WrenOS` with minimal disruption.

## Why the rename happened

The project has matured from an early compatibility/bootstrap kit into a broader operator control plane.

`WrenOS` better reflects the actual product scope:
- inspectable control plane
- evidence-first operator workflow
- paper-first safety posture
- OpenClaw-compatible deployment model

## What changed

### Repository rename
- Old: `wrensignal/WrenOS`
- New: `wrensignal/wrenOS`

### CLI rename
- Old primary command: `wrenos`
- New primary command: `wrenos`

### Config directory rename
- Old: `.wrenos/`
- New: `.wrenos/`

### Command surface updates
- Primary bootstrap command: `wrenos bootstrap-wrenos`
- Legacy alias still accepted: `wrenos bootstrap-openclaw` (deprecated)
- Migration command added: `wrenos migrate`

### Package naming updates
- Internal workspace scope moved to `@wrenos/*`
- `speakeasy-ai` package name intentionally unchanged for compatibility stability

## Compatibility aliases

Legacy aliases and old config fallbacks have been removed in the full naming purge.
Use only the canonical `wrenos` command and `.wrenos/` config path.

## Manual migration steps

```bash
# from repo root
mkdir -p .wrenos
cp .wrenos/config.json .wrenos/config.json

# optional: migrate pack/template artifacts manually if present
cp .wrenos/pack-*.json .wrenos/ 2>/dev/null || true
cp -R .wrenos/openclaw-templates .wrenos/wrenos-templates 2>/dev/null || true

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
| `wrenos init --profile research-agent` | `wrenos init --profile research-agent` |
| `wrenos doctor` | `wrenos doctor` |
| `wrenos status` | `wrenos status` |
| `wrenos bootstrap-openclaw` | `wrenos bootstrap-wrenos` |
| `.wrenos/config.json` | `.wrenos/config.json` |

## What stayed the same

Conceptually, the system remains the same:
- safe-by-default
- paper-first execution posture
- profile/pack-driven operator config
- OpenClaw-compatible runtime integration
- inspectable, file-based control-plane workflow
