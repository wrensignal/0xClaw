#!/usr/bin/env node
const required = [
  'PROFILE',
  'OPENCLAW_API_KEY',
  'TELEGRAM_BOT_TOKEN'
];

const conditional = [
  {
    name: 'AGENT_WALLET_PRIVATE_KEY',
    when: () => String(process.env.WRENOS_ENABLE_EXECUTION || '').toLowerCase() === 'true',
    reason: 'Required only when execution-enabled flows are explicitly turned on.'
  }
];

const missing = required.filter((k) => !process.env[k]);
const missingConditional = conditional
  .filter((c) => c.when() && !process.env[c.name])
  .map((c) => ({ name: c.name, reason: c.reason }));

const ok = missing.length === 0 && missingConditional.length === 0;

const actionable = [];
if (missing.includes('PROFILE')) actionable.push('Set PROFILE to a supported template (e.g. research-agent).');
if (missing.includes('OPENCLAW_API_KEY')) actionable.push('Add OPENCLAW_API_KEY as a Railway secret env var.');
if (missing.includes('TELEGRAM_BOT_TOKEN')) actionable.push('Add TELEGRAM_BOT_TOKEN as a Railway secret env var.');
if (missingConditional.length) actionable.push('Either provide AGENT_WALLET_PRIVATE_KEY or disable execution-enabled mode.');

console.log(JSON.stringify({
  ok,
  check: 'railway-env-preflight',
  required,
  missing,
  missingConditional,
  inferred: {
    profile: process.env.PROFILE || null,
    executionEnabled: String(process.env.WRENOS_ENABLE_EXECUTION || 'false').toLowerCase() === 'true'
  },
  remediation: actionable
}, null, 2));

process.exit(ok ? 0 : 1);
