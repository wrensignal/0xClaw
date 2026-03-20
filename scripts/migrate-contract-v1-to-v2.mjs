#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function migrateStrategyCheck(v1) {
  return {
    version: '2.0.0',
    strategy: { id: v1.strategy_id },
    status: v1.status,
    checks: v1.checks || [],
    compat: {
      migrated_from: '1.0.0',
      migration_rule: 'strategy_id -> strategy.id'
    },
    generated_at: v1.generated_at
  };
}

function migrateExplainability(v1) {
  return {
    version: '2.0.0',
    decision: v1.decision,
    confidence: v1.confidence,
    reasons: v1.reasons || [],
    evidence: [],
    compat: {
      migrated_from: '1.0.0',
      migration_rule: 'added evidence[] with safe empty default'
    },
    generated_at: v1.generated_at
  };
}

function validateV2(payload, kind) {
  const errs = [];
  if (payload.version !== '2.0.0') errs.push('version must be 2.0.0');
  if (!payload.compat || !payload.compat.migration_rule) errs.push('compat block required');
  if (kind === 'strategy-check') {
    if (!payload.strategy || !payload.strategy.id) errs.push('strategy.id required');
  }
  if (kind === 'explainability') {
    if (!Array.isArray(payload.evidence)) errs.push('evidence array required');
  }
  return errs;
}

if (process.argv.length < 4) {
  console.error('Usage: node scripts/migrate-contract-v1-to-v2.mjs <strategy-check|explainability> <input-json-path>');
  process.exit(1);
}

const kind = process.argv[2];
const inputPath = process.argv[3];
const input = JSON.parse(readFileSync(inputPath, 'utf8'));

let output;
if (kind === 'strategy-check') output = migrateStrategyCheck(input);
else if (kind === 'explainability') output = migrateExplainability(input);
else {
  console.error('Unknown kind');
  process.exit(1);
}

const errors = validateV2(output, kind);
const ok = errors.length === 0;
console.log(JSON.stringify({ ok, kind, output, errors }, null, 2));
process.exit(ok ? 0 : 1);
