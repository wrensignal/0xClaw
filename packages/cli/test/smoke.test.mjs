import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, existsSync, readFileSync, rmSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(THIS_DIR, '../../..');
const CLI = path.join(REPO_ROOT, 'packages/cli/src/index.mjs');
const TEMPLATES_SRC = path.join(REPO_ROOT, 'packages/profiles/templates');

function setupWorkspace() {
  const dir = mkdtempSync(path.join(tmpdir(), 'wrenos-cli-smoke-'));
  cpSync(TEMPLATES_SRC, path.join(dir, 'packages/profiles/templates'), { recursive: true });
  return dir;
}

function run(cwd, args, env = {}) {
  return spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
}

const PROFILE_TEMPLATES = [
  'research-agent',
  'research-only',
  'solo-trader-paper',
  'trading-agent-paper',
  'trading-agent-live-disabled',
  'meme-discovery-research',
  'meme-discovery-trading-paper'
];

test('demo runs zero-config signal->decision flow with safe defaults', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, ['demo']);
  assert.equal(out.status, 0, out.stderr || out.stdout);
  const payload = JSON.parse(out.stdout);
  assert.equal(payload.mode, 'demo');
  assert.equal(payload.liveExecution, false);
  assert.equal(payload.requireExplicitApproval, true);
  assert.equal(Array.isArray(payload.flow), true);
  assert.equal(existsSync(path.join(cwd, '.wrenos/demo-last-run.json')), true);

  rmSync(cwd, { recursive: true, force: true });
});

test('init creates config and mcp template', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(out.status, 0, out.stderr || out.stdout);
  assert.equal(existsSync(path.join(cwd, '.wrenos/config.json')), true);
  assert.equal(existsSync(path.join(cwd, '.mcp.json')), true);

  const cfg = JSON.parse(readFileSync(path.join(cwd, '.wrenos/config.json'), 'utf8'));
  assert.equal(cfg.profile, 'research-agent');

  rmSync(cwd, { recursive: true, force: true });
});

test('doctor passes after init', () => {
  const cwd = setupWorkspace();
  let out = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  out = run(cwd, ['doctor'], { HELIUS_API_KEY: 'test-helius-key' });
  assert.equal(out.status, 0, out.stderr || out.stdout);
  const payload = JSON.parse(out.stdout);
  assert.equal(payload.ok, true);

  rmSync(cwd, { recursive: true, force: true });
});

test('all 7 profile templates pass init + doctor runtime validation', () => {
  const failures = [];

  for (const profile of PROFILE_TEMPLATES) {
    const cwd = setupWorkspace();

    const initOut = run(cwd, ['init', '--profile', profile]);
    if (initOut.status !== 0) {
      failures.push({ profile, step: 'init', stderr: initOut.stderr, stdout: initOut.stdout });
      rmSync(cwd, { recursive: true, force: true });
      continue;
    }

    const doctorOut = run(cwd, ['doctor'], { HELIUS_API_KEY: 'test-helius-key' });
    if (doctorOut.status !== 0) {
      failures.push({ profile, step: 'doctor', stderr: doctorOut.stderr, stdout: doctorOut.stdout });
      rmSync(cwd, { recursive: true, force: true });
      continue;
    }

    const payload = JSON.parse(doctorOut.stdout);
    if (payload.ok !== true) {
      failures.push({ profile, step: 'doctor-payload', payload });
    }

    rmSync(cwd, { recursive: true, force: true });
  }

  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
});

test('doctor reports MCP env/startup diagnostics when required env missing', () => {
  const cwd = setupWorkspace();
  let out = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  out = run(cwd, ['doctor']);
  assert.notEqual(out.status, 0);
  const payload = JSON.parse(out.stdout);
  const mcpEnvCheck = payload.checks.find((c) => c.name === 'mcp.server.helius.env');
  assert.equal(Boolean(mcpEnvCheck), true);
  assert.equal(mcpEnvCheck.ok, false);

  rmSync(cwd, { recursive: true, force: true });
});

test('config set writes nested values', () => {
  const cwd = setupWorkspace();
  let out = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  out = run(cwd, ['config', 'set', 'risk.maxTradeUsd', '42']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  const cfg = JSON.parse(readFileSync(path.join(cwd, '.wrenos/config.json'), 'utf8'));
  assert.equal(cfg.risk.maxTradeUsd, 42);

  rmSync(cwd, { recursive: true, force: true });
});

test('wallet setup supports privy provider metadata', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, [
    'wallet', 'setup',
    '--provider', 'privy',
    '--private-key', '0x' + '11'.repeat(32),
    '--privy-user-id', 'user_test',
    '--privy-wallet-id', 'wallet_test',
    '--auth-state', 'signed_in'
  ]);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  const wallet = JSON.parse(readFileSync(path.join(cwd, '.wrenos/wallet.json'), 'utf8'));
  assert.equal(wallet.provider, 'privy');
  assert.equal(wallet.source, 'privy');
  assert.equal(wallet.privy.userId, 'user_test');
  assert.equal(wallet.privy.walletId, 'wallet_test');
  assert.equal(wallet.privy.auth.state, 'signed_in');

  rmSync(cwd, { recursive: true, force: true });
});

test('wallet setup supports privy signed_out metadata state', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, [
    'wallet', 'setup',
    '--provider', 'privy',
    '--auth-state', 'signed_out',
    '--privy-user-id', 'user_signed_out'
  ]);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  const wallet = JSON.parse(readFileSync(path.join(cwd, '.wrenos/wallet.json'), 'utf8'));
  assert.equal(wallet.provider, 'privy');
  assert.equal(wallet.privateKey, null);
  assert.equal(wallet.privy.auth.state, 'signed_out');

  rmSync(cwd, { recursive: true, force: true });
});

test('wallet setup supports privy expired state with refresh token', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, [
    'wallet', 'setup',
    '--provider', 'privy',
    '--auth-state', 'expired',
    '--privy-refresh-token', 'refresh_token_test',
    '--privy-user-id', 'user_expired'
  ]);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  const wallet = JSON.parse(readFileSync(path.join(cwd, '.wrenos/wallet.json'), 'utf8'));
  assert.equal(wallet.provider, 'privy');
  assert.equal(wallet.privy.auth.state, 'expired');
  assert.equal(wallet.privy.auth.refreshToken, 'refresh_token_test');

  rmSync(cwd, { recursive: true, force: true });
});

test('wallet setup rejects malformed privy auth state', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, [
    'wallet', 'setup',
    '--provider', 'privy',
    '--auth-state', 'weird_state'
  ]);
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /Invalid --auth-state/);

  rmSync(cwd, { recursive: true, force: true });
});

test('legacy config fallback emits migration warning in status', () => {
  const cwd = setupWorkspace();
  mkdirSync(path.join(cwd, '.legacy'), { recursive: true });
  writeFileSync(path.join(cwd, '.legacy/config.json'), JSON.stringify({ profile: 'research-agent', liveExecution: false }, null, 2));

  const out = run(cwd, ['status']);
  assert.equal(out.status, 0);
  const payload = JSON.parse(out.stdout);
  assert.equal(payload.system.configFormat, 'legacy-compat');

  rmSync(cwd, { recursive: true, force: true });
});

test('legacy compatibility alias emits deprecation warning', () => {
  const cwd = setupWorkspace();
  const legacyEntry = path.join(cwd, 'legacy');
  copyFileSync(CLI, legacyEntry);

  const out = spawnSync('node', [legacyEntry, 'status'], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env }
  });
  assert.match(out.stderr, /\[deprecation\].*legacy/i);

  rmSync(cwd, { recursive: true, force: true });
});

test('migrate no-ops safely when no legacy directory exists', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, ['migrate']);
  assert.equal(out.status, 0);
  assert.match(out.stdout, /No legacy \.legacy directory found/i);

  rmSync(cwd, { recursive: true, force: true });
});
