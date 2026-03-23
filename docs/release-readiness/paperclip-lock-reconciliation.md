# Paperclip stale execution lock reconciliation (operator note)

This note documents how to diagnose stale lock conflicts when `POST /api/issues/{id}/checkout` returns `409` even though the issue is assigned to the same agent.

## Symptom
- Checkout conflict includes stale `executionRunId`
- `checkoutRunId` remains `null`
- Assignee matches current agent

## Diagnostic command

```bash
PAPERCLIP_API_URL=http://127.0.0.1:3100 \
PAPERCLIP_API_KEY="$PAPERCLIP_API_KEY" \
PAPERCLIP_RUN_ID="$PAPERCLIP_RUN_ID" \
PAPERCLIP_AGENT_ID="$PAPERCLIP_AGENT_ID" \
node scripts/paperclip/reconcile-stale-lock.mjs <issueId>
```

## Current observed behavior (WRE-150)
- `PATCH /api/issues/{id}` with `executionRunId`/`checkoutRunId` returns `200`
- but lock fields do not persist on follow-up `GET /api/issues/{id}`
- `POST /checkout` still returns `409`

This indicates lock fields are server-owned and require backend reconciliation logic.
