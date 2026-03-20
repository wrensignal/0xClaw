# Docs Provenance + Drift Workflow

## Provenance marker
- Source file: `docs/provenance.json`
- Includes tracked docs + synced commit SHA.

## Drift check

```bash
node scripts/check-docs-drift.mjs --strict
```

Fail conditions:
- `docs/provenance.json` synced commit differs from current HEAD
- Any tracked doc in provenance file is missing
- Quickstart missing required core CLI command mentions

## Re-sync flow
1. Update docs content as needed.
2. Set `docs/provenance.json` `syncedCommit` to current `git rev-parse HEAD`.
3. Run strict check and commit updated report.
