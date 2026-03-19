import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
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

function run(cwd, args) {
  return spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

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

  out = run(cwd, ['doctor']);
  assert.equal(out.status, 0, out.stderr || out.stdout);
  const payload = JSON.parse(out.stdout);
  assert.equal(payload.ok, true);

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
