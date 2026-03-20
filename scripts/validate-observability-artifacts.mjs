#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const base = process.cwd();
const artifacts = [
  ['examples/artifacts/decision-log.sample.json', 'schemas/observability/decision-log.schema.json'],
  ['examples/artifacts/health-summary.sample.json', 'schemas/observability/health-summary.schema.json'],
  ['examples/artifacts/run-trace.sample.json', 'schemas/observability/run-trace.schema.json']
];

function validateByRequired(schema, payload) {
  const missing = (schema.required || []).filter((k) => payload[k] === undefined);
  return { ok: missing.length === 0, missing };
}

const results = [];
for (const [artifactPath, schemaPath] of artifacts) {
  const a = path.join(base, artifactPath);
  const s = path.join(base, schemaPath);
  if (!existsSync(a) || !existsSync(s)) {
    results.push({ artifactPath, schemaPath, ok: false, error: 'missing_file' });
    continue;
  }
  const artifact = JSON.parse(readFileSync(a, 'utf8'));
  const schema = JSON.parse(readFileSync(s, 'utf8'));
  const v = validateByRequired(schema, artifact);
  results.push({ artifactPath, schemaPath, ok: v.ok, missing: v.missing });
}

const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ ok, results }, null, 2));
process.exit(ok ? 0 : 1);
