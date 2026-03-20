# WRE-122 Managed Referral Funnel Contract

## Contract objective
Define deterministic managed-lane routing verification behavior with bounded timeout and explicit terminal outcomes.

## Rules

1. Decision + explainability complete first.
2. Routing verification runs next with bounded timeout.
3. If routing verification fails/times out in managed lane:
   - `failure_code` must be `FAILED_ROUTING`
   - finalization cannot be success.
4. Dual-lane policy:
   - managed lane enforces routing verification gate before success.
   - OSS lane remains configurable by operator policy.

## Artifacts

- Schema: `schemas/managed/referral-funnel-contract.schema.json`
- Sample outcome: `examples/managed/referral-funnel.outcome.sample.json`
- Validator: `scripts/validate-managed-referral-contract.mjs`

## Verification command

```bash
node scripts/validate-managed-referral-contract.mjs
```

Expected output: `ok: true` for canonical sample.
