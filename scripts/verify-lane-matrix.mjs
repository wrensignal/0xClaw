#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const laneArg = process.argv.find((a) => a.startsWith('--lane='));
const lane = laneArg ? laneArg.split('=')[1] : 'shared';
if (!['shared', 'hosted', 'operator'].includes(lane)) {
  console.error('Invalid --lane value. Use shared|hosted|operator');
  process.exit(1);
}

const root = process.cwd();
const checks = [];

function run(name, cmd) {
  try {
    execSync(cmd, { stdio: 'pipe', cwd: root, env: process.env });
    checks.push({ name, lane, ok: true });
  } catch (err) {
    checks.push({ name, lane, ok: false, error: String(err?.message || err) });
  }
}

function fileCheck(name, relPath) {
  const ok = fs.existsSync(path.join(root, relPath));
  checks.push({ name, lane, ok, file: relPath });
}

// shared checks run in all lanes
run('shared/docs-drift', 'npm run docs:drift');
run('shared/contract-managed', 'npm run contract:managed');

if (lane === 'hosted') {
  run('hosted/env-doc-guardrail', 'npm run contract:env:hosted-docs');
  fileCheck('hosted/docs-entrypoint', 'docs/hosted-quickstart.md');
}

if (lane === 'operator') {
  fileCheck('operator/docs-entrypoint', 'docs/operator/README.md');
  fileCheck('operator/env-contract', 'docs/env-contract-operator.md');
}

const failed = checks.filter((c) => !c.ok);
const out = {
  generatedAt: new Date().toISOString(),
  lane,
  checks,
  summary: {
    total: checks.length,
    passed: checks.length - failed.length,
    failed: failed.length
  }
};

const reportPath = path.join(root, 'docs/reports/lane-coverage-report.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(out, null, 2));

console.log(JSON.stringify(out.summary));
if (failed.length) {
  console.error('Lane matrix verification failed:', failed.map((f) => f.name).join(', '));
  process.exit(1);
}
