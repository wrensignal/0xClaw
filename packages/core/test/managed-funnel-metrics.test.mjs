import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveManagedFunnelMetrics } from '../src/index.mjs';

test('deriveManagedFunnelMetrics computes decision time, drop-off, and no-trade reasons', () => {
  const events = [
    { step: 'intake', at: '2026-03-19T10:00:00.000Z', status: 'ok' },
    { step: 'decision', at: '2026-03-19T10:00:02.000Z', status: 'ok' },
    { step: 'routing_verification', at: '2026-03-19T10:00:03.000Z', status: 'fail', terminalOutcome: 'failed' },
    { step: 'finalization', at: '2026-03-19T10:00:04.000Z', status: 'ok', terminalOutcome: 'no_trade', noTradeReason: 'below_confidence_threshold' },
    { step: 'finalization', at: '2026-03-19T10:00:05.000Z', status: 'ok', terminalOutcome: 'no_trade', noTradeReason: 'below_confidence_threshold' },
    { step: 'finalization', at: '2026-03-19T10:00:06.000Z', status: 'ok', terminalOutcome: 'no_trade', noTradeReason: 'spread_too_wide' }
  ];

  const m = deriveManagedFunnelMetrics('session-1', events);
  assert.equal(m.timeToDecisionMs, 2000);
  assert.equal(m.dropOffStep, 'routing_verification');
  assert.equal(m.terminalOutcome, 'no_trade');
  assert.deepEqual(m.topNoTradeReasons[0], { reason: 'below_confidence_threshold', count: 2 });
  assert.deepEqual(m.topNoTradeReasons[1], { reason: 'spread_too_wide', count: 1 });
});
