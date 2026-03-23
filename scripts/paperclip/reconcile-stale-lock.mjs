#!/usr/bin/env node

/**
 * Paperclip stale lock reconciliation diagnostic.
 * Uses documented endpoints only:
 * - GET /api/issues/{id}
 * - PATCH /api/issues/{id}
 * - POST /api/issues/{id}/checkout
 */

const API_BASE = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100';
const API_KEY = process.env.PAPERCLIP_API_KEY;
const RUN_ID = process.env.PAPERCLIP_RUN_ID;
const AGENT_ID = process.env.PAPERCLIP_AGENT_ID;
const ISSUE_ID = process.argv[2];

if (!API_KEY || !RUN_ID || !AGENT_ID || !ISSUE_ID) {
  console.error('Usage: PAPERCLIP_API_KEY=... PAPERCLIP_RUN_ID=... PAPERCLIP_AGENT_ID=... node scripts/paperclip/reconcile-stale-lock.mjs <issueId>');
  process.exit(2);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'X-Paperclip-Run-Id': RUN_ID,
  'Content-Type': 'application/json'
};

async function call(path, method = 'GET', body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const before = await call(`/api/issues/${ISSUE_ID}`);
const patchAttempt = await call(`/api/issues/${ISSUE_ID}`, 'PATCH', {
  executionRunId: RUN_ID,
  checkoutRunId: RUN_ID
});
const after = await call(`/api/issues/${ISSUE_ID}`);
const checkout = await call(`/api/issues/${ISSUE_ID}/checkout`, 'POST', {
  agentId: AGENT_ID,
  expectedStatuses: ['todo', 'backlog', 'blocked', 'in_progress']
});

const report = {
  issueId: ISSUE_ID,
  runId: RUN_ID,
  before: {
    status: before.json?.status,
    executionRunId: before.json?.executionRunId,
    checkoutRunId: before.json?.checkoutRunId
  },
  patchAttempt: {
    status: patchAttempt.status,
    body: patchAttempt.json
  },
  after: {
    status: after.json?.status,
    executionRunId: after.json?.executionRunId,
    checkoutRunId: after.json?.checkoutRunId
  },
  checkoutAttempt: {
    status: checkout.status,
    body: checkout.json
  },
  reconciled: Boolean(
    after.json?.executionRunId === RUN_ID &&
    after.json?.checkoutRunId === RUN_ID &&
    checkout.status === 200
  )
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.reconciled ? 0 : 1);
