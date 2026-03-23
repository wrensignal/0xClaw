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

const inferenceKeyOptions = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'AI_API_KEY' // backwards-compatible umbrella key
];

const missing = required.filter((k) => !process.env[k]);
const missingConditional = conditional
  .filter((c) => c.when() && !process.env[c.name])
  .map((c) => ({ name: c.name, reason: c.reason }));

const hasInferenceKey = inferenceKeyOptions.some((k) => Boolean(process.env[k]));

const ok = missing.length === 0 && missingConditional.length === 0 && hasInferenceKey;

const actionable = [];
if (missing.includes('PROFILE')) actionable.push('Set PROFILE to a supported template (e.g. research-agent).');
if (missing.includes('OPENCLAW_API_KEY')) actionable.push('Add OPENCLAW_API_KEY as a Railway secret env var.');
if (missing.includes('TELEGRAM_BOT_TOKEN')) actionable.push('Add TELEGRAM_BOT_TOKEN as a Railway secret env var.');
if (missingConditional.length) actionable.push('Either provide AGENT_WALLET_PRIVATE_KEY or disable execution-enabled mode.');
if (!hasInferenceKey) actionable.push('Set at least one inference provider key: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY (AI_API_KEY also supported for compatibility).');

console.log(JSON.stringify({
  ok,
  check: 'railway-env-preflight',
  required,
  missing,
  missingConditional,
  inferenceKeyOptions,
  inferred: {
    profile: process.env.PROFILE || null,
    executionEnabled: String(process.env.WRENOS_ENABLE_EXECUTION || 'false').toLowerCase() === 'true',
    hasInferenceKey,
    inferenceKeysPresent: inferenceKeyOptions.filter((k) => Boolean(process.env[k]))
  },
  remediation: actionable
}, null, 2));

process.exit(ok ? 0 : 1);
