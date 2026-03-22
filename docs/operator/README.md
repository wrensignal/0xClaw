# Operator lane (advanced/custom runtime)

Use this lane for OpenClaw/operator-managed deployments requiring topology and adapter overrides.

## Operator deep path
1. Review architecture boundaries
2. Apply operator env contract
3. Configure runtime topology and adapter routing
4. Run drift/conformance checks before launch

## Required references
- Architecture split: `docs/release-readiness/future-lane-split-architecture.md`
- Operator env contract: `docs/env-contract-operator.md`
- MCP/runtime signatures: `docs/mcp-doctor-signatures.md`
- Safety and execution posture: `docs/safety.md`

## Recommended validation steps
```bash
wrenos doctor
wrenos status
npm run verify
```

## Fast baseline first?
If you want the minimal hosted baseline before custom operator tuning:
- `docs/hosted-quickstart.md`
