#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const TOOLS = [
  {
    name: 'wrenos.discovery.scan_token_universe',
    description: 'Run a WrenOS-style token discovery scan over configured sources and return ranked candidates.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', minimum: 1, maximum: 200, default: 25 },
        minCompositeScore: { type: 'number', minimum: 0, maximum: 1, default: 0.55 },
        profile: { type: 'string' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'wrenos.scoring.score_token',
    description: 'Score one token with WrenOS composite lanes (wallet flow, liquidity, momentum, social, holder, news, safety).',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        profile: { type: 'string' },
        weights: { type: 'object' }
      },
      required: ['token'],
      additionalProperties: true
    }
  },
  {
    name: 'wrenos.risk.assess_portfolio',
    description: 'Assess portfolio risk posture and return risk controls guidance (sizing, drawdown gates, kill-switch posture).',
    inputSchema: {
      type: 'object',
      properties: {
        positions: { type: 'array' },
        maxDailyDrawdownPct: { type: 'number' },
        maxTradeUsd: { type: 'number' }
      },
      additionalProperties: true
    }
  },
  {
    name: 'wrenos.backtesting.run_strategy_backtest',
    description: 'Run a backtest request envelope and return summary stats (return, drawdown, hit rate, Sharpe proxy).',
    inputSchema: {
      type: 'object',
      properties: {
        strategy: { type: 'string' },
        window: { type: 'string', default: '90d' },
        capitalUsd: { type: 'number', default: 1000 }
      },
      required: ['strategy'],
      additionalProperties: true
    }
  }
];

const cwd = process.cwd();
const activeConfigPath = existsSync(path.join(cwd, '.wrenos/config.json'))
  ? path.join(cwd, '.wrenos/config.json')
  : null;

function now() {
  return new Date().toISOString();
}

function loadConfig() {
  if (!activeConfigPath) return {};
  try {
    return JSON.parse(readFileSync(activeConfigPath, 'utf8'));
  } catch {
    return {};
  }
}

function discovery(args = {}) {
  return {
    generatedAt: now(),
    mode: 'stub-envelope',
    note: 'Wire this tool to live discovery adapters/feeds for production output.',
    request: {
      limit: args.limit ?? 25,
      minCompositeScore: args.minCompositeScore ?? 0.55,
      profile: args.profile ?? loadConfig().profile ?? null
    },
    candidates: []
  };
}

function scoring(args = {}) {
  return {
    generatedAt: now(),
    mode: 'stub-envelope',
    token: args.token,
    weights: args.weights ?? null,
    compositeScore: null,
    lanes: {
      walletFlow: null,
      liquidityQuality: null,
      volumeMomentum: null,
      socialVelocity: null,
      holderDistribution: null,
      newsCatalyst: null,
      contractSafety: null
    },
    note: 'Connect to WrenOS scoring pipeline for live lane values.'
  };
}

function risk(args = {}) {
  return {
    generatedAt: now(),
    mode: 'stub-envelope',
    request: args,
    recommended: {
      action: 'hold',
      reason: 'No live risk engine wired in this scaffold.',
      constraints: {
        maxDailyDrawdownPct: args.maxDailyDrawdownPct ?? null,
        maxTradeUsd: args.maxTradeUsd ?? null
      }
    }
  };
}

function backtest(args = {}) {
  return {
    generatedAt: now(),
    mode: 'stub-envelope',
    strategy: args.strategy,
    window: args.window ?? '90d',
    capitalUsd: args.capitalUsd ?? 1000,
    summary: {
      totalReturnPct: null,
      maxDrawdownPct: null,
      winRate: null,
      sharpeProxy: null,
      tradeCount: null
    },
    note: 'Connect to strategy/backtesting runtime artifacts for real metrics.'
  };
}

function toolResult(name, args) {
  switch (name) {
    case 'wrenos.discovery.scan_token_universe': return discovery(args);
    case 'wrenos.scoring.score_token': return scoring(args);
    case 'wrenos.risk.assess_portfolio': return risk(args);
    case 'wrenos.backtesting.run_strategy_backtest': return backtest(args);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

function send(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendErr(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;

    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    const { id, method, params } = msg;

    try {
      if (method === 'initialize') {
        send(id, {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'wrenos-mcp', version: '0.1.0' },
          capabilities: { tools: {} }
        });
      } else if (method === 'tools/list') {
        send(id, { tools: TOOLS });
      } else if (method === 'tools/call') {
        const name = params?.name;
        const args = params?.arguments || {};
        const payload = toolResult(name, args);
        send(id, {
          content: [
            { type: 'text', text: JSON.stringify(payload, null, 2) }
          ]
        });
      } else if (method === 'notifications/initialized') {
        // no-op
      } else {
        sendErr(id ?? null, -32601, `Method not found: ${method}`);
      }
    } catch (e) {
      sendErr(id ?? null, -32000, e?.message || String(e));
    }
  }
});