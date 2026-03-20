# WRE-125 Zero-Config Demo Mode (Signal -> Decision)

## Objective
Provide a safe, no-setup demo path that showcases the core signal-to-decision workflow.

## Command

```bash
wrenos demo
```

## Behavior

- Requires no prior `init` or external API keys.
- Creates `.wrenos/demo-last-run.json` artifact.
- Emits machine-readable JSON to stdout.
- Enforces safe defaults:
  - `liveExecution: false`
  - `requireExplicitApproval: true`

## Demo flow stages

1. `collect_signal`
2. `evaluate_threshold`
3. `decision` (`hold` or `paper_proposal`)

## Why this is safe

- No live trading side effects
- No wallet signing required
- No external route assumptions

## Verification

Covered by CLI smoke test:
- `demo runs zero-config signal->decision flow with safe defaults`
