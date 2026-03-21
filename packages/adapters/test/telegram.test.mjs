import test from 'node:test';
import assert from 'node:assert/strict';
import { createTelegramAdapter } from '../src/telegram.mjs';

test('telegram adapter handles operator commands and state toggles', async () => {
  let paperChanged = null;
  const tg = createTelegramAdapter({ profile: 'trading-agent-paper', paperMode: true }, {
    onPaperModeChange: async (v) => { paperChanged = v; }
  });

  const s1 = await tg.handleText('/status');
  assert.equal(s1.ok, true);
  assert.equal(s1.paperMode, true);

  const p = await tg.handleText('/paper off');
  assert.equal(p.ok, true);
  assert.equal(p.paperMode, false);
  assert.equal(paperChanged, false);

  const a = await tg.handleText('/alerts off');
  assert.equal(a.ok, true);
  assert.equal(a.alertsEnabled, false);
});

test('telegram adapter notify formats discovery/trade/heartbeat/performance alerts', async () => {
  const sent = [];
  const tg = createTelegramAdapter({}, {
    sendAlert: async ({ message }) => sent.push(message)
  });

  await tg.notify({ type: 'discovery_hit', symbol: 'BONK', score: 0.82, source: 'scan' });
  await tg.notify({ type: 'trade_signal', side: 'BUY', symbol: 'SOL', confidence: 0.74, paperMode: true });
  await tg.notify({ type: 'heartbeat_alert', severity: 'warning', message: 'feed degraded' });
  await tg.notify({ type: 'performance_report', period: '24h', pnlUsd: 123, winRate: 0.6 });

  assert.equal(sent.length, 4);
  assert.match(sent[0], /Discovery hit/);
  assert.match(sent[1], /Trade signal/);
  assert.match(sent[2], /Heartbeat alert/);
  assert.match(sent[3], /Performance/);
});

test('telegram adapter wires heartbeat/performance command hooks', async () => {
  const tg = createTelegramAdapter({}, {
    getHeartbeat: async () => ({ ok: true, type: 'heartbeat', summary: 'all healthy' }),
    getPerformance: async () => ({ ok: true, type: 'performance', period: '24h', pnlUsd: 42 })
  });

  const hb = await tg.handleText('/heartbeat');
  const pr = await tg.handleText('/performance');
  assert.equal(hb.summary, 'all healthy');
  assert.equal(pr.pnlUsd, 42);
});
