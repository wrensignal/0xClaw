#!/usr/bin/env node

// Exhaustive managed-lane contract matrix for WRE-123

function evalManagedOutcome(input) {
  const out = {
    lane: input.lane,
    branch: input.branch,
    failureCode: null,
    finalStatus: 'success',
    terminal: true
  };

  if (input.lane !== 'managed') {
    out.finalStatus = input.decisionOk && input.explainabilityOk ? 'success' : 'failed';
    return out;
  }

  // Managed lane strict ordering: decision + explainability first
  if (!input.decisionOk || !input.explainabilityOk) {
    out.failureCode = 'FAILED_PRECHECK';
    out.finalStatus = 'failed';
    return out;
  }

  if (input.branch === 'validator_fail') {
    out.failureCode = 'FAILED_VALIDATOR';
    out.finalStatus = 'failed';
    return out;
  }

  if (input.branch === 'setup_fail') {
    out.failureCode = 'FAILED_SETUP';
    out.finalStatus = 'failed';
    return out;
  }

  if (input.branch === 'routing_fail') {
    out.failureCode = 'FAILED_ROUTING';
    out.finalStatus = 'failed';
    return out;
  }

  if (input.branch === 'routing_timeout') {
    out.failureCode = 'FAILED_ROUTING';
    out.finalStatus = 'failed';
    return out;
  }

  if (input.branch === 'no_trade') {
    out.failureCode = null;
    out.finalStatus = 'aborted';
    return out;
  }

  // happy path
  out.finalStatus = 'success';
  return out;
}

const matrix = [
  {
    id: 'managed.validator_fail',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'validator_fail' },
    expect: { finalStatus: 'failed', failureCode: 'FAILED_VALIDATOR' }
  },
  {
    id: 'managed.routing_fail',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'routing_fail' },
    expect: { finalStatus: 'failed', failureCode: 'FAILED_ROUTING' }
  },
  {
    id: 'managed.routing_timeout',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'routing_timeout' },
    expect: { finalStatus: 'failed', failureCode: 'FAILED_ROUTING' }
  },
  {
    id: 'managed.setup_fail',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'setup_fail' },
    expect: { finalStatus: 'failed', failureCode: 'FAILED_SETUP' }
  },
  {
    id: 'managed.no_trade',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'no_trade' },
    expect: { finalStatus: 'aborted', failureCode: null }
  },
  {
    id: 'managed.success',
    input: { lane: 'managed', decisionOk: true, explainabilityOk: true, branch: 'success' },
    expect: { finalStatus: 'success', failureCode: null }
  }
];

const results = matrix.map((row) => {
  const actual = evalManagedOutcome(row.input);
  const ok = actual.finalStatus === row.expect.finalStatus && actual.failureCode === row.expect.failureCode;
  return { id: row.id, ok, expect: row.expect, actual };
});

const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ ok, suite: 'contract:managed:matrix', cases: results.length, results }, null, 2));
process.exit(ok ? 0 : 1);
