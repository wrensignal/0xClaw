#!/usr/bin/env node

// OSS lane should keep minimal invariant only: configurable policy, no managed-only strict routing gate.

function evalOss(input) {
  return {
    lane: 'oss',
    finalStatus: input.policyAllowsProceed ? 'success' : 'aborted',
    managedStrictRoutingGateApplied: false
  };
}

const scenario = evalOss({ policyAllowsProceed: true });
const ok = scenario.finalStatus === 'success' && scenario.managedStrictRoutingGateApplied === false;

console.log(JSON.stringify({ ok, suite: 'contract:oss:invariant', scenario }, null, 2));
process.exit(ok ? 0 : 1);
