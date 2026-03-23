import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const script = path.resolve('scripts/discovery-mode-check.mjs');

function run(extraEnv = {}) {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    BIRDEYE_API_KEY: '',
    HELIUS_API_KEY: '',
    LUNARCRUSH_API_KEY: '',
    JUPITER_API_KEY: '',
    ...extraEnv
  };
  const out = spawnSync(process.execPath, [script], { env, encoding: 'utf8' });
  return { code: out.status, json: JSON.parse(out.stdout) };
}

test('basic mode when no provider keys set', () => {
  const r = run({});
  assert.equal(r.code, 0);
  assert.equal(r.json.mode, 'basic');
  assert.equal(r.json.basic.active, true);
  assert.equal(r.json.full.activeCount, 0);
  assert.ok(r.json.remediation.length > 0, 'should include remediation guidance');
  assert.match(r.json.summary, /Basic discovery mode/);
});

test('full mode with BIRDEYE_API_KEY only', () => {
  const r = run({ BIRDEYE_API_KEY: 'test-key' });
  assert.equal(r.code, 0);
  assert.equal(r.json.mode, 'full');
  assert.equal(r.json.full.activeCount, 1);
  assert.match(r.json.summary, /Full discovery mode/);
  assert.match(r.json.summary, /Birdeye/);
});

test('full mode with all provider keys', () => {
  const r = run({ BIRDEYE_API_KEY: 'k', HELIUS_API_KEY: 'k', LUNARCRUSH_API_KEY: 'k', JUPITER_API_KEY: 'k' });
  assert.equal(r.code, 0);
  assert.equal(r.json.mode, 'full');
  assert.equal(r.json.full.activeCount, 4);
  assert.equal(r.json.remediation.length, 0);
});

test('basic mode remediation lists all missing keys', () => {
  const r = run({});
  const text = r.json.remediation.join('\n');
  assert.match(text, /BIRDEYE_API_KEY/);
  assert.match(text, /HELIUS_API_KEY/);
  assert.match(text, /LUNARCRUSH_API_KEY/);
  assert.match(text, /JUPITER_API_KEY/);
});
