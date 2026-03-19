#!/usr/bin/env node
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const cli = path.join(repoRoot, 'packages/cli/src/index.mjs');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const workdir = mkdtempSync(path.join(tmpdir(), 'wrenos-cli-acceptance-'));

function runStep(name, args, env = {}) {
  const r = spawnSync('node', [cli, ...args], {
    cwd: workdir,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
  return {
    name,
    args,
    ok: r.status === 0,
    exitCode: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim()
  };
}

const steps = [];

// Positive-path acceptance
steps.push(runStep('init', ['init', '--profile', 'research-agent']));
steps.push(runStep('doctor-with-env', ['doctor'], { HELIUS_API_KEY: 'test-helius-key' }));
steps.push(runStep('config-set-liveExecution', ['config', 'set', 'liveExecution', 'false']));
steps.push(runStep('status', ['status']));
steps.push(runStep('start-once', ['start', '--once', '--interval', '1']));
steps.push(runStep('wallet-setup-local', ['wallet', 'setup', '--provider', 'local']));

// Negative-path acceptance
steps.push(runStep('doctor-missing-env', ['doctor']));
steps.push(runStep('wallet-setup-privy-invalid-auth-state', ['wallet', 'setup', '--provider', 'privy', '--auth-state', 'invalid_state']));

// Broken MCP case: mutate .mcp.json command to invalid binary and expect doctor failure
const mcpPath = path.join(workdir, '.mcp.json');
const badMcp = {
  mcpServers: {
    helius: {
      command: 'definitely-not-a-real-binary',
      args: ['noop'],
      env: { HELIUS_API_KEY: '<required>' }
    }
  }
};
writeFileSync(mcpPath, JSON.stringify(badMcp, null, 2));
steps.push(runStep('doctor-broken-mcp-command', ['doctor'], { HELIUS_API_KEY: 'test-helius-key' }));

const byName = Object.fromEntries(steps.map((s) => [s.name, s]));
const assertions = {
  init: byName.init?.ok === true,
  doctor_with_env: byName['doctor-with-env']?.ok === true,
  config_set: byName['config-set-liveExecution']?.ok === true,
  status: byName.status?.ok === true,
  start_once: byName['start-once']?.ok === true,
  wallet_setup_local: byName['wallet-setup-local']?.ok === true,
  doctor_missing_env_fails: byName['doctor-missing-env']?.ok === false,
  privy_invalid_auth_fails: byName['wallet-setup-privy-invalid-auth-state']?.ok === false,
  doctor_broken_mcp_fails: byName['doctor-broken-mcp-command']?.ok === false
};

const ok = Object.values(assertions).every(Boolean);
const report = {
  ok,
  runId,
  contract: 'v1-cli-acceptance',
  workdir,
  assertions,
  steps
};

const outDir = path.join(repoRoot, '.tmp', 'acceptance');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${runId}.json`);
writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log(JSON.stringify({ ok, reportFile: outFile, assertions }, null, 2));
process.exit(ok ? 0 : 1);
