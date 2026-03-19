#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const run = (args) => spawnSync('node', ['packages/cli/src/index.mjs', ...args], { encoding: 'utf8' });

const checks = [
  { name: 'doctor', args: ['doctor'] },
  { name: 'status', args: ['status'] },
  { name: 'start-once', args: ['start', '--once', '--interval', '1'] }
];

const results = checks.map((c) => {
  const r = run(c.args);
  return {
    name: c.name,
    ok: r.status === 0,
    exitCode: r.status,
    stdout: (r.stdout || '').trim().slice(0, 2000),
    stderr: (r.stderr || '').trim().slice(0, 2000)
  };
});

const ok = results.every((r) => r.ok);
const remediation = [];
if (!results.find((r) => r.name === 'doctor')?.ok) remediation.push('Run env preflight and init profile before deploy health checks.');
if (!results.find((r) => r.name === 'status')?.ok) remediation.push('Ensure .wrenos/config.json exists and parses in runtime workspace.');
if (!results.find((r) => r.name === 'start-once')?.ok) remediation.push('Inspect start --once output and fix failing doctor checks before retrying.');

console.log(JSON.stringify({ ok, check: 'railway-postdeploy-health', results, remediation }, null, 2));
process.exit(ok ? 0 : 1);
