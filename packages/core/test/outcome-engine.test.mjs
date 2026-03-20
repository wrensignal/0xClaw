import test from 'node:test';
import assert from 'node:assert/strict';
import { TerminalOutcomes, ReasonCodes, deriveOutcome, validateExplainabilityContract } from '../src/index.mjs';

test('terminal outcomes are constrained to canonical set', () => {
  assert.deepEqual(Object.values(TerminalOutcomes), [
    'SUCCESS',
    'NO_TRADE',
    'FAILED_SETUP',
    'FAILED_CONTRACT',
    'FAILED_ROUTING'
  ]);
});

test('deriveOutcome maps deterministic failure precedence', () => {
  assert.equal(deriveOutcome({ setupOk: false }).outcome, TerminalOutcomes.FAILED_SETUP);
  assert.equal(deriveOutcome({ setupOk: true, contractOk: false }).outcome, TerminalOutcomes.FAILED_CONTRACT);
  assert.equal(deriveOutcome({ setupOk: true, contractOk: true, routingOk: false }).outcome, TerminalOutcomes.FAILED_ROUTING);
  assert.equal(deriveOutcome({ noTrade: true }).outcome, TerminalOutcomes.NO_TRADE);
  assert.equal(deriveOutcome({ executed: true }).outcome, TerminalOutcomes.SUCCESS);
});

test('managed lane is fail-closed when no terminal branch selected', () => {
  const result = deriveOutcome({ managed: true, setupOk: true, contractOk: true, routingOk: true, executed: false, noTrade: false });
  assert.equal(result.outcome, TerminalOutcomes.FAILED_CONTRACT);
  assert.equal(result.reason_code, ReasonCodes.MANAGED_FAIL_CLOSED);
});

test('explainability validator returns valid OR invalid+reason_code contract', () => {
  const valid = validateExplainabilityContract({
    decision: 'hold',
    confidence: 'medium',
    reasons: ['signal below threshold']
  });
  assert.equal(valid.valid, true);
  assert.ok(valid.value);

  const invalid = validateExplainabilityContract({ decision: 'hold', confidence: 'medium', reasons: [] });
  assert.deepEqual(invalid, { valid: false, reason_code: ReasonCodes.EMPTY_REASONS });
});
