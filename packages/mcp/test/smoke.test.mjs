import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startServer() {
  const serverPath = path.resolve(__dirname, '../src/index.mjs');
  const proc = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });
  proc.stdout.setEncoding('utf8');
  return proc;
}

function request(proc, msg) {
  return new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id === msg.id) {
            proc.stdout.off('data', onData);
            resolve(parsed);
            return;
          }
        } catch {}
      }
    };
    proc.stdout.on('data', onData);
    proc.stdin.write(JSON.stringify(msg) + '\n');
    setTimeout(() => {
      proc.stdout.off('data', onData);
      reject(new Error(`Timeout waiting for response to id=${msg.id}`));
    }, 4000);
  });
}

test('mcp tools/list returns core WrenOS capability surface', async (t) => {
  const proc = startServer();
  t.after(() => proc.kill('SIGTERM'));

  const init = await request(proc, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  assert.equal(init.result.serverInfo.name, 'wrenos-mcp');

  const list = await request(proc, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  const names = list.result.tools.map((x) => x.name);
  assert.ok(names.includes('wrenos.discovery.scan_token_universe'));
  assert.ok(names.includes('wrenos.scoring.score_token'));
  assert.ok(names.includes('wrenos.risk.assess_portfolio'));
  assert.ok(names.includes('wrenos.backtesting.run_strategy_backtest'));
});

test('mcp tools/call returns structured envelope payload', async (t) => {
  const proc = startServer();
  t.after(() => proc.kill('SIGTERM'));

  await request(proc, { jsonrpc: '2.0', id: 11, method: 'initialize', params: {} });

  const call = await request(proc, {
    jsonrpc: '2.0',
    id: 12,
    method: 'tools/call',
    params: {
      name: 'wrenos.backtesting.run_strategy_backtest',
      arguments: { strategy: 'mean-reversion', window: '30d', capitalUsd: 2500 }
    }
  });

  const payload = JSON.parse(call.result.content[0].text);
  assert.equal(payload.strategy, 'mean-reversion');
  assert.equal(payload.window, '30d');
  assert.equal(payload.capitalUsd, 2500);
  assert.ok(payload.summary);
});
