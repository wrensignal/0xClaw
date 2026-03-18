import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(THIS_DIR, '../../..');
const CLI = path.join(REPO_ROOT, 'packages/cli/src/index.mjs');
const TEMPLATES_SRC = path.join(REPO_ROOT, 'packages/profiles/templates');

function setupWorkspace() {
  const dir = mkdtempSync(path.join(tmpdir(), 'wrenos-cli-regression-'));
  cpSync(TEMPLATES_SRC, path.join(dir, 'packages/profiles/templates'), { recursive: true });
  return dir;
}

function run(cwd, args) {
  return spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8'
  });
}

test('init-pack creates pack config and .mcp.json', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, ['init-pack', '--pack', 'meme-discovery']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  assert.equal(existsSync(path.join(cwd, '.wrenos/pack-meme-discovery.json')), true);
  assert.equal(existsSync(path.join(cwd, '.mcp.json')), true);

  const pack = JSON.parse(readFileSync(path.join(cwd, '.wrenos/pack-meme-discovery.json'), 'utf8'));
  assert.equal(pack.pack, 'meme-discovery');

  const mcp = JSON.parse(readFileSync(path.join(cwd, '.mcp.json'), 'utf8'));
  assert.equal(Boolean(mcp['agenti-lite']), true);
  assert.equal(Boolean(mcp['pump-fun-sdk-lite']), true);
  assert.equal(Boolean(mcp['helius']), true);

  rmSync(cwd, { recursive: true, force: true });
});

test('bootstrap-wrenos creates template set', () => {
  const cwd = setupWorkspace();
  const out = run(cwd, ['bootstrap-wrenos']);
  assert.equal(out.status, 0, out.stderr || out.stdout);

  assert.equal(existsSync(path.join(cwd, '.wrenos/wrenos-templates/AGENTS.md')), true);
  assert.equal(existsSync(path.join(cwd, '.wrenos/wrenos-templates/HEARTBEAT.md')), true);
  assert.equal(existsSync(path.join(cwd, '.wrenos/wrenos-templates/README.md')), true);

  rmSync(cwd, { recursive: true, force: true });
});

test('test inference command returns structured diagnostics (failure path)', () => {
  const cwd = setupWorkspace();
  const initOut = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(initOut.status, 0, initOut.stderr || initOut.stdout);

  const cfgPath = path.join(cwd, '.wrenos/config.json');
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  cfg.inference = { ...(cfg.inference || {}), baseUrl: 'http://127.0.0.1:1' };
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));

  const out = run(cwd, ['test', 'inference']);
  const payload = JSON.parse(out.stdout);

  assert.equal(payload.check, 'inference-routing');
  assert.equal(typeof payload.ok, 'boolean');
  assert.equal(payload.baseUrl, 'http://127.0.0.1:1');

  rmSync(cwd, { recursive: true, force: true });
});

test('test execution command returns structured diagnostics envelope', () => {
  const cwd = setupWorkspace();
  const initOut = run(cwd, ['init', '--profile', 'research-agent']);
  assert.equal(initOut.status, 0, initOut.stderr || initOut.stdout);

  const out = run(cwd, ['test', 'execution']);
  const payload = JSON.parse(out.stdout);

  assert.equal(payload.venue, 'jupiter');
  assert.equal(typeof payload.ok, 'boolean');
  assert.equal(typeof payload.platformFeeBps, 'number');

  rmSync(cwd, { recursive: true, force: true });
});

test('railway deploy assumptions file remains present and parseable', () => {
  const railwayPath = path.join(REPO_ROOT, 'railway.json');
  const deployDocPath = path.join(REPO_ROOT, 'RAILWAY_DEPLOY.md');

  assert.equal(existsSync(railwayPath), true);
  assert.equal(existsSync(deployDocPath), true);

  const railway = JSON.parse(readFileSync(railwayPath, 'utf8'));
  assert.equal(Array.isArray(railway.services), true);
  assert.equal(Boolean(railway.services[0]?.envVars?.PROFILE), true);
  assert.equal(Boolean(railway.services[0]?.envVars?.OPENCLAW_API_KEY), true);
});
