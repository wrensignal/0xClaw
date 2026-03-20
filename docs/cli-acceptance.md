# CLI Acceptance Suite (v1)

This suite codifies shippable v1 CLI behavior and emits machine-readable evidence.

## Command

```bash
npm run acceptance:cli
```

## What it validates

### Positive path
- `init --profile research-agent`
- `doctor` (with required env set)
- `config set liveExecution false`
- `status`
- `start --once --interval 1`
- `wallet setup --provider local`

### Negative path
- `doctor` fails when required env is missing
- `wallet setup --provider privy --auth-state invalid_state` fails
- `doctor` fails with intentionally broken MCP command wiring

## Machine-readable evidence artifact

Each run writes JSON to:

```text
.tmp/acceptance/<run-id>.json
```

Artifact includes:
- assertion outcomes
- per-step command/exit/stdout/stderr
- top-level `ok` status

## CI integration

The suite is wired into:
- `npm run verify`
- GitHub Actions `ci` workflow step: **CLI acceptance suite**

## Failure interpretation

- If a positive-path assertion fails, bootstrap/runtime contract regressed.
- If a negative-path assertion does not fail as expected, validation gates are too permissive.
- Use the JSON report to pinpoint failing step and remediation target.
