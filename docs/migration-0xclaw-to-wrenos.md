# Migration guide: 0xClaw → WrenOS

This project has been rebranded from **0xClaw** to **WrenOS**.

## Compatibility policy

Current release keeps compatibility aliases to reduce breakage:

- CLI binary: `wrenos` (primary), `0xclaw` (alias)
- Config directory: `.wrenos/` (primary), `.0xclaw/` (legacy fallback)
- bootstrap command: `bootstrap-wrenos` (primary), `bootstrap-openclaw` (alias)

## Operator migration steps

1. Keep existing setup running with current `0xclaw` commands if needed.
2. Start using `wrenos` commands for all new workflows.
3. Migrate config:

```bash
mkdir -p .wrenos
cp .0xclaw/config.json .wrenos/config.json
```

4. Regenerate templates into the new path:

```bash
wrenos bootstrap-wrenos
```

5. Validate:

```bash
wrenos doctor
wrenos status
```

## Import/package naming

Internal workspace package names now use `@wrenos/*`.

If you imported old internal package names, update imports accordingly.

### Transitional stability note

- `speakeasy-ai` package name remains unchanged intentionally to avoid disproportionate external breakage.
- WrenOS naming applies to control-plane/workspace packages (`@wrenos/*`) while this SDK keeps its established package identity.

## Deprecation intent

Legacy aliases are temporary and planned for removal in **v0.3.0**.
Track release notes for final confirmation of removal timing.
