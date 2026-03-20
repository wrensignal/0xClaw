# WRE-123 Managed-Only Contract Matrix

## Goal
Provide exhaustive managed-lane outcome coverage and enforce it as a required CI gate.

## Matrix coverage

Managed lane branches covered by `scripts/contract-managed-matrix.mjs`:

1. `validator_fail` -> `FAILED_VALIDATOR`, terminal `failed`
2. `routing_fail` -> `FAILED_ROUTING`, terminal `failed`
3. `routing_timeout` -> `FAILED_ROUTING`, terminal `failed`
4. `setup_fail` -> `FAILED_SETUP`, terminal `failed`
5. `no_trade` -> terminal `aborted` (non-success)
6. `success` -> terminal `success`

## OSS invariant

`script/contract-oss-invariant.mjs` enforces minimal OSS rule:
- OSS lane remains policy-configurable
- managed strict routing gate is **not** force-applied to OSS lane

## Required CI gate

CI now includes:
- **Managed contract gate** (`npm run contract:managed`)

This gate is intended to be required for merge policy in repository branch protections.

## Commands

```bash
npm run contract:managed
npm run contract:oss-invariant
```

## Acceptance mapping

- Managed matrix includes validator/routing/setup/no-trade branches
- OSS lane checked with minimal invariant test
- Required gate wired in CI and verify script
