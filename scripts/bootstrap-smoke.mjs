#!/usr/bin/env node
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const cli = path.join(repoRoot, 'packages/cli/src/index.mjs');
const dir = mkdtempSync(path.join(tmpdir(), 'wrenos-bootstrap-smoke-'));

const steps = [
  ['init', '--profile', 'research-agent'],
  ['doctor'],
  ['status'],
  ['start', '--once', '--interval', '1']
];

function remediation(step) {
  const cmd = step[0];
  if (cmd === 'init') return 'Check profile exists and workspace is writable.';
  if (cmd === 'doctor') return 'Run init first and inspect diagnostics for missing files or adapters.';
  if (cmd === 'status') return 'Ensure init succeeded and .wrenos/config.json exists.';
  if (cmd === 'start') return 'Run doctor/status, resolve failing checks, then retry one-shot run.';
  return 'Inspect stderr and rerun with the same command.';
}

for (const args of steps) {
  const r = spawnSync('node', [cli, ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, HELIUS_API_KEY: process.env.HELIUS_API_KEY || 'smoke-helius-key' }
  });
  if (r.status !== 0) {
    console.error(JSON.stringify({
      ok: false,
      step: args.join(' '),
      cwd: dir,
      remediation: remediation(args),
      stdout: r.stdout,
      stderr: r.stderr
    }, null, 2));
    process.exit(r.status || 1);
  }
}

console.log(JSON.stringify({ ok: true, smokeDir: dir, contract: 'clone->init->doctor->status->start --once' }, null, 2));
