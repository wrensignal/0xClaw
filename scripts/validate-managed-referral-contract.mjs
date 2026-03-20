#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const base = process.cwd();
const schemaPath = path.join(base, 'schemas/managed/referral-funnel-contract.schema.json');
const samplePath = path.join(base, 'examples/managed/referral-funnel.outcome.sample.json');

if (!existsSync(schemaPath) || !existsSync(samplePath)) {
  console.error(JSON.stringify({ ok: false, error: 'missing_contract_files' }, null, 2));
  process.exit(1);
}

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const sample = JSON.parse(readFileSync(samplePath, 'utf8'));

const requiredMissing = (schema.required || []).filter((k) => sample[k] === undefined);
let ok = requiredMissing.length === 0;
const errors = [];
if (!ok) errors.push(`missing required fields: ${requiredMissing.join(', ')}`);

if (sample.lane === 'managed') {
  if (sample.routing_verification?.status !== 'ok') {
    if (sample.routing_verification?.failure_code !== 'FAILED_ROUTING') {
      ok = false;
      errors.push('managed failure path must map to FAILED_ROUTING');
    }
    if (sample.finalization?.status === 'success') {
      ok = false;
      errors.push('managed lane cannot finalize success when routing verification is not ok');
    }
  }
  if (typeof sample.routing_verification?.timeout_ms !== 'number' || sample.routing_verification.timeout_ms < 1 || sample.routing_verification.timeout_ms > 60000) {
    ok = false;
    errors.push('routing_verification.timeout_ms must be bounded 1..60000');
  }
}

console.log(JSON.stringify({ ok, errors, checked: ['required_fields', 'FAILED_ROUTING_mapping', 'bounded_timeout', 'managed_success_gate'] }, null, 2));
process.exit(ok ? 0 : 1);
