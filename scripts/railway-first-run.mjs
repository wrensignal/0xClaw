#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const profile = process.env.PROFILE || 'research-agent';

function run(step, args) {
  const r = spawnSync('node', ['packages/cli/src/index.mjs', ...args], { encoding: 'utf8' });
  return { step, args, ok: r.status === 0, exitCode: r.status, stdout: r.stdout, stderr: r.stderr };
}

const steps = [
  { step:'env-preflight', ...(function(){ const r=spawnSync('node',['scripts/railway-env-preflight.mjs'],{encoding:'utf8'}); return {ok:r.status===0, exitCode:r.status, stdout:r.stdout, stderr:r.stderr}; })() },
  run('init', ['init', '--profile', profile]),
  run('doctor', ['doctor']),
  run('status', ['status']),
  run('start-once', ['start', '--once', '--interval', '1'])
];

const ok = steps.every((s) => s.ok);
console.log(JSON.stringify({ ok, flow: 'railway-first-run', profile, steps }, null, 2));
process.exit(ok ? 0 : 1);
