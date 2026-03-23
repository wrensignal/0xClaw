import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const script = path.resolve('scripts/railway-env-preflight.mjs');

function run(extraEnv = {}) {
  const env = {
    ...process.env,
    PROFILE: 'research-agent',
    OPENCLAW_API_KEY: 'ok',
    TELEGRAM_BOT_TOKEN: 'ok',
    WRENOS_ENABLE_EXECUTION: 'false',
    OPENAI_API_KEY: '',
    ANTHROPIC_API_KEY: '',
    GEMINI_API_KEY: '',
    AI_API_KEY: '',
    ...extraEnv
  };
  const out = spawnSync(process.execPath, [script], { env, encoding: 'utf8' });
  return {
    code: out.status,
    json: JSON.parse(out.stdout)
  };
}

test('preflight passes with OPENAI_API_KEY', () => {
  const r = run({ OPENAI_API_KEY: 'k' });
  assert.equal(r.code, 0);
  assert.equal(r.json.ok, true);
});

test('preflight passes with ANTHROPIC_API_KEY', () => {
  const r = run({ ANTHROPIC_API_KEY: 'k' });
  assert.equal(r.code, 0);
  assert.equal(r.json.ok, true);
});

test('preflight passes with GEMINI_API_KEY', () => {
  const r = run({ GEMINI_API_KEY: 'k' });
  assert.equal(r.code, 0);
  assert.equal(r.json.ok, true);
});

test('preflight fails with clear remediation when no inference key is set', () => {
  const r = run({});
  assert.equal(r.code, 1);
  assert.equal(r.json.ok, false);
  assert.equal(r.json.inferred.hasInferenceKey, false);
  assert.match(
    r.json.remediation.join('\n'),
    /Set at least one inference provider key: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY/
  );
});
