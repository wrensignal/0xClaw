# WRE-124 Embedded Pilot Instrumentation (Managed Funnel)

This pass adds session-level managed funnel metrics for pilot instrumentation.

## Metrics covered

- `timeToDecisionMs`
- `dropOffStep`
- `terminalOutcome`
- `topNoTradeReasons`

## Implementation

- Metric derivation utility:
  - `packages/core/src/index.mjs` → `deriveManagedFunnelMetrics(sessionId, events)`
- Unit test:
  - `packages/core/test/managed-funnel-metrics.test.mjs`
- Schema:
  - `schemas/managed/embedded-pilot-metrics.schema.json`

## Event model assumptions

Input events can include:
- `step`
- `at` (ISO timestamp)
- `status`
- `terminalOutcome` (optional)
- `noTradeReason` (optional)

## Interpretation

- `timeToDecisionMs`: first event timestamp -> successful decision stage timestamp
- `dropOffStep`: first failed/timeout step in session
- `terminalOutcome`: terminal outcome from latest terminal event
- `topNoTradeReasons`: frequency-ranked reasons where terminal outcome is `no_trade`

## Integration guidance

- Emit raw step events from managed funnel runtime.
- Call `deriveManagedFunnelMetrics` at session end (or checkpoint).
- Persist result as pilot telemetry artifact for downstream reporting.
