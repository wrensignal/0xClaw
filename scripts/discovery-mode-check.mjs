#!/usr/bin/env node

/**
 * Discovery mode contract check.
 *
 * Reports whether the current environment supports Basic or Full discovery mode
 * based on the presence of external market-data provider keys.
 *
 * Basic mode: agenti-lite + crypto-news-lite + pump-fun-sdk-lite (no external keys required)
 * Full mode:  Basic + provider-enriched discovery (Birdeye, Helius, LunarCrush, Jupiter, etc.)
 */

const providerKeys = [
  { name: 'BIRDEYE_API_KEY', service: 'Birdeye', capability: 'token analytics, price/volume data, holder distribution' },
  { name: 'HELIUS_API_KEY', service: 'Helius', capability: 'enriched Solana RPC, transaction parsing, webhooks' },
  { name: 'LUNARCRUSH_API_KEY', service: 'LunarCrush', capability: 'social sentiment metrics, influencer tracking' },
  { name: 'JUPITER_API_KEY', service: 'Jupiter', capability: 'DEX aggregation, swap routing, price impact estimation' }
];

const basicServices = [
  { name: 'agenti-lite', capability: 'social/wallet analytics (bundled, no key required)' },
  { name: 'crypto-news-lite', capability: 'crypto news aggregation — 49 tools (bundled, no key required)' },
  { name: 'pump-fun-sdk-lite', capability: 'Pump.fun launchpad monitoring (bundled, no key required)' }
];

const present = providerKeys.filter((k) => Boolean(process.env[k.name]));
const missing = providerKeys.filter((k) => !process.env[k.name]);
const mode = present.length > 0 ? 'full' : 'basic';

const remediation = [];
if (mode === 'basic') {
  remediation.push(
    'Discovery is running in Basic mode — only bundled MCP servers are active.',
    'For enriched discovery (holder analytics, social sentiment, DEX routing), add one or more provider keys:',
    ...missing.map((k) => `  - ${k.name}: ${k.service} — ${k.capability}`)
  );
}

const report = {
  ok: true, // basic mode is valid, just degraded
  check: 'discovery-mode',
  mode,
  basic: {
    services: basicServices,
    active: true
  },
  full: {
    providers: providerKeys.map((k) => ({
      ...k,
      present: Boolean(process.env[k.name])
    })),
    activeCount: present.length,
    totalAvailable: providerKeys.length
  },
  summary: mode === 'full'
    ? `Full discovery mode: ${present.length}/${providerKeys.length} provider keys configured (${present.map((k) => k.service).join(', ')})`
    : `Basic discovery mode: bundled MCP servers only. Add provider keys for enriched data.`,
  remediation
};

console.log(JSON.stringify(report, null, 2));
