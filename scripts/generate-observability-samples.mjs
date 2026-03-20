#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'examples', 'artifacts');
mkdirSync(outDir, { recursive: true });
const now = new Date();
const runId = `sample-${now.toISOString().replace(/[:.]/g, '-')}`;

const decisionLog = {
  run_id: runId,
  timestamp: now.toISOString(),
  profile: 'research-agent',
  decision: 'hold',
  confidence: 'medium',
  inputs: ['token-scan', 'whale-tracker', 'news-scanner'],
  rationale: 'Signal confidence below execution threshold; preserving paper-first posture.'
};

const healthSummary = {
  run_id: runId,
  timestamp: now.toISOString(),
  overall: 'ok',
  checks: [
    { name: 'config.present', ok: true, detail: 'config loaded' },
    { name: 'mcp.wiring', ok: true, detail: 'default servers wired' },
    { name: 'inference.route', ok: true, detail: 'primary route healthy' }
  ]
};

const runTrace = {
  run_id: runId,
  started_at: new Date(now.getTime() - 1200).toISOString(),
  ended_at: now.toISOString(),
  steps: [
    { name: 'init-context', status: 'ok', duration_ms: 120 },
    { name: 'collect-signals', status: 'ok', duration_ms: 640 },
    { name: 'policy-evaluation', status: 'ok', duration_ms: 310 },
    { name: 'emit-artifacts', status: 'ok', duration_ms: 80 }
  ]
};

writeFileSync(path.join(outDir, 'decision-log.sample.json'), JSON.stringify(decisionLog, null, 2));
writeFileSync(path.join(outDir, 'health-summary.sample.json'), JSON.stringify(healthSummary, null, 2));
writeFileSync(path.join(outDir, 'run-trace.sample.json'), JSON.stringify(runTrace, null, 2));

console.log(JSON.stringify({ ok: true, run_id: runId, outDir }, null, 2));
