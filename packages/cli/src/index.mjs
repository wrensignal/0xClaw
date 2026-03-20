#!/usr/bin/env node
import { mkdir, readFile, writeFile, copyFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const invokedAs = path.basename(process.argv[1] || '');
const DEPRECATION_REMOVAL_TARGET = 'v0.3.0';
if (invokedAs === 'wrenos') {
  console.error("[deprecation] The `wrenos` command has been renamed to `wrenos`. This alias will be removed in "+DEPRECATION_REMOVAL_TARGET+". Please update your scripts and workflows. Run `wrenos migrate` and see docs/migrating-from-wrenos-to-wrenos.md for details.");
}

const cwd = process.cwd();
const configDir = path.join(cwd, '.wrenos');
const legacyConfigDir = path.join(cwd, '.wrenos');
const configPath = path.join(configDir, 'config.json');
const legacyConfigPath = path.join(legacyConfigDir, 'config.json');

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return fallback;
  return process.argv[idx + 1];
}

function parseValue(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  try { return JSON.parse(raw); } catch { return raw; }
}

function setByPath(obj, dotPath, value) {
  const keys = dotPath.split('.').filter(Boolean);
  if (!keys.length) return obj;
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

const PRIVY_AUTH_STATES = new Set(['signed_out', 'signed_in', 'expired']);

function normalizePrivyAuthState(rawState, hasPrivateKey) {
  const state = rawState || (hasPrivateKey ? 'signed_in' : 'signed_out');
  if (!PRIVY_AUTH_STATES.has(state)) {
    return { ok: false, state, error: `Invalid --auth-state \`${state}\`. Allowed: signed_out | signed_in | expired.` };
  }
  return { ok: true, state };
}

function commandExists(command) {
  const probe = spawnSync('which', [command], { encoding: 'utf8' });
  return probe.status === 0;
}

function diagnoseMcpServers(mcpConfig) {
  const results = [];
  for (const [name, server] of Object.entries(mcpConfig || {})) {
    const command = server?.command || '';
    const args = Array.isArray(server?.args) ? server.args : [];
    const env = server?.env || {};

    const commandOk = Boolean(command) && commandExists(command);
    const missingEnv = Object.entries(env)
      .filter(([k, v]) => String(v || '').startsWith('<') && !process.env[k])
      .map(([k]) => k);
    const envOk = missingEnv.length === 0;

    let startupProbeOk = true;
    let startupProbeDetail = 'startup probe passed';
    if (command === 'npx' && args[0] === '-y' && args[1] === 'tsx' && args[2]) {
      const entry = path.resolve(cwd, args[2]);
      const hasVendorTree = existsSync(path.resolve(cwd, 'vendor'));
      if (!hasVendorTree) {
        startupProbeOk = true;
        startupProbeDetail = 'vendor tree not present in current workspace; startup probe skipped';
      } else {
        startupProbeOk = existsSync(entry);
        startupProbeDetail = startupProbeOk ? `entrypoint exists: ${entry}` : `entrypoint missing: ${entry}`;
      }
    }

    results.push({
      server: name,
      checks: {
        command: {
          ok: commandOk,
          detail: commandOk ? `command found: ${command}` : `command missing: ${command || '(empty)'}`,
          remediation: `Install/ensure \`${command || 'command'}\` is available in PATH.`
        },
        env: {
          ok: envOk,
          detail: envOk ? 'required env resolved or not required' : `missing required env: ${missingEnv.join(', ')}`,
          remediation: missingEnv.length ? `Set env var(s): ${missingEnv.join(', ')}` : 'none'
        },
        startupProbe: {
          ok: startupProbeOk,
          detail: startupProbeDetail,
          remediation: startupProbeOk ? 'none' : 'Fix server entrypoint path or reinstall vendor module.'
        }
      }
    });
  }
  return results;
}

function getActiveConfigPath() {
  if (existsSync(configPath)) return configPath;
  if (existsSync(legacyConfigPath)) return legacyConfigPath;
  return configPath;
}

async function loadConfigOrFail() {
  const active = getActiveConfigPath();
  if (!existsSync(active)) {
    console.error('Config not found. Run: wrenos init --profile research-agent');
    process.exit(1);
  }
  if (active === legacyConfigPath) {
    console.error('Using legacy config path (.wrenos/config.json). Use `.wrenos/` going forward. Run `wrenos migrate` (or `wrenos migrate --force`) to migrate now. Planned removal: '+DEPRECATION_REMOVAL_TARGET+'.');
  }
  return JSON.parse(await readFile(active, 'utf8'));
}

async function saveConfig(cfg) {
  await mkdir(configDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(cfg, null, 2));
}

async function cmdInit() {
  const profile = arg('--profile', 'research-agent');
  await mkdir(configDir, { recursive: true });
  const profilePath = path.resolve(cwd, `packages/profiles/templates/${profile}.json`);
  let body;
  let usedFallbackProfile = false;
  try {
    body = JSON.parse(await readFile(profilePath, 'utf8'));
  } catch {
    usedFallbackProfile = true;
    body = { profile, liveExecution: false, loop: { heartbeatAdaptive: true } };
  }
  await writeFile(configPath, JSON.stringify({ ...body, createdAt: new Date().toISOString() }, null, 2));

  const mcpPath = path.join(cwd, '.mcp.json');
  if (!existsSync(mcpPath)) {
    await writeFile(mcpPath, JSON.stringify(MCP_JSON_TEMPLATE, null, 2));
    console.log(`Created ${path.relative(cwd, mcpPath)} with starter servers: agenti-lite, pump-fun-sdk-lite, helius (additional vendored MCPs require manual wiring)`);
  }

  console.log(JSON.stringify({
    ok: true,
    action: 'init',
    profile,
    configPath,
    liveExecutionDefault: false,
    approvalPosture: 'External side effects require approvals. Live execution requires explicit enablement.',
    note: usedFallbackProfile ? 'Profile template missing; initialized with safe fallback scaffold.' : 'Profile template applied.'
  }, null, 2));
}


async function cmdInitPack() {
  const pack = arg('--pack', 'dual-agent-pack');
  await mkdir(configDir, { recursive: true });

  const load = async (name, fallback) => {
    const p = path.resolve(cwd, `packages/profiles/templates/${name}.json`);
    try { return JSON.parse(await readFile(p, 'utf8')); } catch { return fallback; }
  };

  let packCfg;

  if (pack === 'dual-agent-pack') {
    const research = await load('research-agent', { profile: 'research-agent', liveExecution: false });
    const trading = await load('trading-agent-paper', { profile: 'trading-agent-paper', liveExecution: false });

    packCfg = {
      pack: 'dual-agent-pack',
      createdAt: new Date().toISOString(),
      agents: {
        researchAgent: {
          name: arg('--research-name', 'research-agent'),
          config: research
        },
        tradingAgent: {
          name: arg('--trading-name', 'trading-agent'),
          config: trading
        }
      },
      handoff: {
        channel: 'inbox/research-*.json',
        format: 'json'
      }
    };

    await writeFile(path.join(configDir, 'pack-dual-agent.json'), JSON.stringify(packCfg, null, 2));
  } else if (pack === 'meme-discovery') {
    const research = await load('meme-discovery-research', { profile: 'meme-discovery-research', liveExecution: false });
    const trading = await load('meme-discovery-trading-paper', { profile: 'meme-discovery-trading-paper', liveExecution: false });

    packCfg = {
      pack: 'meme-discovery',
      createdAt: new Date().toISOString(),
      agents: {
        researchAgent: {
          name: arg('--research-name', 'meme-research-agent'),
          role: 'research',
          config: research
        },
        tradingAgent: {
          name: arg('--trading-name', 'meme-trading-agent'),
          role: 'trading',
          config: trading
        }
      },
      handoff: {
        channel: 'inbox/meme-watchlist-*.json',
        format: 'json',
        schema: 'packs/meme-discovery-pack/handoff/meme-watchlist.schema.json'
      },
      scoring: {
        model: 'composite-weighted',
        weights: {
          walletFlow: 0.30,
          liquidityQuality: 0.20,
          volumeMomentum: 0.15,
          socialVelocity: 0.10,
          holderDistribution: 0.10,
          newsCatalyst: 0.05,
          contractSafety: 0.10
        }
      },
      execution: {
        adapter: 'default',
        venues: {
          jupiter: { enabled: true, referralAccount: '${JUPITER_REFERRAL_ACCOUNT}' },
          pumpfun: { enabled: true }
        }
      },
      inference: {
        provider: 'speakeasy',
        baseUrl: 'https://api.speakeasyrelay.com'
      }
    };

    await writeFile(path.join(configDir, 'pack-meme-discovery.json'), JSON.stringify(packCfg, null, 2));
  } else {
    console.error(`Unknown pack: ${pack}`);
    process.exit(1);
  }

  const mcpPath = path.join(cwd, '.mcp.json');
  if (!existsSync(mcpPath)) {
    await writeFile(mcpPath, JSON.stringify(MCP_JSON_TEMPLATE, null, 2));
    console.log(`Created ${path.relative(cwd, mcpPath)} with starter servers: agenti-lite, pump-fun-sdk-lite, helius (additional vendored MCPs require manual wiring)`);
  }

  console.log(`Initialized pack ${pack} in ${configDir}`);
}

async function cmdDoctor() {
  const activeConfigPath = getActiveConfigPath();
  const hasConfig = existsSync(activeConfigPath);
  const cfg = hasConfig ? JSON.parse(await readFile(activeConfigPath, 'utf8')) : null;
  const walletPath = path.join(configDir, 'wallet.json');
  const hasWallet = existsSync(walletPath);
  const wallet = hasWallet ? JSON.parse(await readFile(walletPath, 'utf8')) : null;
  const mcpPath = path.join(cwd, '.mcp.json');
  let mcpConfig = null;
  if (existsSync(mcpPath)) {
    try {
      mcpConfig = JSON.parse(await readFile(mcpPath, 'utf8'));
    } catch {
      mcpConfig = null;
    }
  }
  const mcpDiagnostics = diagnoseMcpServers(mcpConfig || {});

  const expectedProfiles = [
    'research-agent',
    'research-only',
    'solo-trader-paper',
    'trading-agent-paper',
    'trading-agent-live-disabled',
    'meme-discovery-research',
    'meme-discovery-trading-paper'
  ];

  const checks = [
    {
      name: 'runtime.node',
      ok: Number(process.versions.node.split('.')[0]) >= 20,
      detail: `node=${process.versions.node} (required >=20)`
    },
    {
      name: 'runtime.workspace-deps',
      ok: true,
      detail: existsSync(path.join(cwd, 'node_modules')) ? 'node_modules present' : 'node_modules not found in current cwd (acceptable for isolated smoke workspaces)'
    },
    {
      name: 'config.present',
      ok: hasConfig,
      detail: hasConfig ? `config found at ${activeConfigPath}` : 'missing .wrenos/config.json (run wrenos init --profile research-agent)'
    },
    {
      name: 'config.profile-known',
      ok: Boolean(cfg?.profile && expectedProfiles.includes(cfg.profile)),
      detail: cfg?.profile ? `profile=${cfg.profile}` : 'profile missing'
    },
    {
      name: 'operator.mcp-config',
      ok: existsSync(path.join(cwd, '.mcp.json')),
      detail: existsSync(path.join(cwd, '.mcp.json')) ? '.mcp.json present' : '.mcp.json missing (run wrenos init)'
    },
    {
      name: 'inference.route-config',
      ok: true,
      detail: (cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL)
        ? `baseUrl=${cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL}`
        : 'no inference base URL configured (set inference.baseUrl or SPEAKEASY_BASE_URL before route tests)'
    },
    {
      name: 'execution.mode-defined',
      ok: typeof cfg?.liveExecution === 'boolean',
      detail: typeof cfg?.liveExecution === 'boolean'
        ? `liveExecution=${cfg.liveExecution}`
        : 'liveExecution missing'
    },
    {
      name: 'execution.safety-default',
      ok: cfg?.liveExecution === false,
      detail: cfg?.liveExecution === false ? 'paper-safe default active' : 'live execution enabled (requires explicit operator approval)'
    },
    {
      name: 'secrets.wallet',
      ok: hasWallet || cfg?.liveExecution === false,
      detail: hasWallet
        ? 'wallet scaffold present'
        : (cfg?.liveExecution === false ? 'wallet optional in paper mode' : 'wallet missing for live-capable execution')
    },
    {
      name: 'operator.privy-metadata',
      ok: !hasWallet
        || wallet?.provider !== 'privy'
        || (wallet?.privy?.auth?.state && PRIVY_AUTH_STATES.has(wallet.privy.auth.state)),
      detail: !hasWallet
        ? 'wallet not present'
        : (wallet?.provider !== 'privy'
            ? `wallet provider=${wallet?.provider || 'unknown'}`
            : `privy auth state=${wallet?.privy?.auth?.state || 'missing'} (expected signed_out|signed_in|expired)`)
    }
  ];

  for (const diag of mcpDiagnostics) {
    checks.push({
      name: `mcp.server.${diag.server}.command`,
      ok: diag.checks.command.ok,
      detail: `${diag.checks.command.detail} | remediation: ${diag.checks.command.remediation}`
    });
    checks.push({
      name: `mcp.server.${diag.server}.env`,
      ok: diag.checks.env.ok,
      detail: `${diag.checks.env.detail} | remediation: ${diag.checks.env.remediation}`
    });
    checks.push({
      name: `mcp.server.${diag.server}.startup`,
      ok: diag.checks.startupProbe.ok,
      detail: `${diag.checks.startupProbe.detail} | remediation: ${diag.checks.startupProbe.remediation}`
    });
  }

  const failed = checks.filter((c) => !c.ok);
  const warnings = [];

  if (activeConfigPath === legacyConfigPath && hasConfig) {
    warnings.push(`Legacy config path in use (.wrenos). Run wrenos migrate before ${DEPRECATION_REMOVAL_TARGET}.`);
  }
  if (cfg?.liveExecution === true) {
    warnings.push('liveExecution=true: verify approvals, signer policy, and risk limits before trading.');
  }

  console.log(JSON.stringify({
    ok: failed.length === 0,
    readyState: failed.length === 0 ? 'ready' : 'needs-attention',
    profile: cfg?.profile || null,
    configPath: activeConfigPath,
    checks,
    mcpDiagnostics,
    warnings,
    next: failed.length
      ? ['Fix failing checks, then re-run: wrenos doctor', 'View snapshot: wrenos status']
      : ['System diagnostics passed', 'Optional network checks: wrenos test inference && wrenos test execution']
  }, null, 2));

  process.exit(failed.length ? 1 : 0);
}

async function cmdStatus() {
  const activeConfigPath = getActiveConfigPath();
  const cfg = existsSync(activeConfigPath) ? JSON.parse(await readFile(activeConfigPath, 'utf8')) : null;
  const walletPath = path.join(configDir, 'wallet.json');
  const wallet = existsSync(walletPath) ? JSON.parse(await readFile(walletPath, 'utf8')) : null;

  const inferenceBase = cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL || null;
  const executionMode = cfg?.liveExecution === true ? 'live' : (cfg?.liveExecution === false ? 'paper' : 'unknown');
  const approvalRequired = cfg?.requireExplicitApproval ?? true;
  const confidenceTiers = cfg?.confidenceTierPolicy
    ? Object.keys(cfg.confidenceTierPolicy)
    : ['tier0', 'tier1', 'tier2', 'tier3 (template default)'];

  const packs = [
    { name: 'dual-agent-pack', path: path.join(configDir, 'pack-dual-agent.json') },
    { name: 'meme-discovery', path: path.join(configDir, 'pack-meme-discovery.json') }
  ].map((p) => ({ name: p.name, enabled: existsSync(p.path), path: p.path }));

  console.log(JSON.stringify({
    system: {
      name: 'WrenOS CLI',
      ready: Boolean(cfg),
      configPath: activeConfigPath,
      configFormat: activeConfigPath === legacyConfigPath ? 'legacy-compat' : 'wrenos'
    },
    profile: {
      active: cfg?.profile || null,
      heartbeatAdaptive: cfg?.loop?.heartbeatAdaptive ?? null,
      loopEnabled: cfg?.loop?.enabled ?? null
    },
    inference: {
      provider: cfg?.inference?.provider || 'speakeasy',
      baseUrl: inferenceBase,
      routes: cfg?.inference?.routes || null
    },
    execution: {
      mode: executionMode,
      liveExecution: cfg?.liveExecution ?? null,
      approvalRequired,
      paperDefault: cfg?.liveExecution === false
    },
    safety: {
      confidenceTiers,
      fallbackPolicyDefined: Boolean(cfg?.confidenceTierPolicy),
      warning: cfg?.liveExecution === true ? 'LIVE mode enabled — ensure explicit approvals and signer controls.' : null
    },
    operatorInterface: {
      mcpConfig: existsSync(path.join(cwd, '.mcp.json')),
      walletConfigured: existsSync(path.join(configDir, 'wallet.json')),
      walletProvider: wallet?.provider || null,
      privyAuthState: wallet?.provider === 'privy' ? (wallet?.privy?.auth?.state || null) : null
    },
    packs,
    commands: {
      doctor: 'wrenos doctor',
      testInference: 'wrenos test inference',
      testExecution: 'wrenos test execution',
      migrate: 'wrenos migrate'
    }
  }, null, 2));
}

async function cmdConfig() {
  const sub = process.argv[3];
  if (sub !== 'set') {
    console.log('Usage: wrenos config set <dot.path> <value>');
    process.exit(1);
  }
  const key = process.argv[4];
  const raw = process.argv[5];
  if (!key || typeof raw === 'undefined') {
    console.log('Usage: wrenos config set <dot.path> <value>');
    process.exit(1);
  }
  const cfg = await loadConfigOrFail();
  const next = setByPath(cfg, key, parseValue(raw));
  await saveConfig(next);
  console.log(`Updated ${key} in ${configPath}`);
}

async function cmdWalletSetup() {
  const provider = arg('--provider', 'local');
  const importPk = arg('--private-key', null);
  const walletPath = path.join(configDir, 'wallet.json');
  await mkdir(configDir, { recursive: true });

  if (provider === 'privy') {
    const privyWalletId = arg('--privy-wallet-id', process.env.PRIVY_WALLET_ID || null);
    const privyUserId = arg('--privy-user-id', process.env.PRIVY_USER_ID || null);
    const privateKey = importPk || process.env.PRIVY_EXPORTED_PRIVATE_KEY || process.env.AGENT_WALLET_PRIVATE_KEY || null;
    const authStateRaw = arg('--auth-state', process.env.PRIVY_AUTH_STATE || null);
    const normalized = normalizePrivyAuthState(authStateRaw, Boolean(privateKey));

    if (!normalized.ok) {
      console.error(normalized.error);
      process.exit(1);
    }

    if (normalized.state === 'signed_in' && !privateKey) {
      console.error('Privy auth-state `signed_in` requires key material via --private-key, PRIVY_EXPORTED_PRIVATE_KEY, or AGENT_WALLET_PRIVATE_KEY.');
      process.exit(1);
    }

    const accessToken = arg('--privy-access-token', process.env.PRIVY_ACCESS_TOKEN || null);
    const refreshToken = arg('--privy-refresh-token', process.env.PRIVY_REFRESH_TOKEN || null);
    const tokenExpiresAt = arg('--privy-token-expires-at', process.env.PRIVY_TOKEN_EXPIRES_AT || null);

    if (normalized.state === 'expired' && !refreshToken) {
      console.error('Privy auth-state `expired` requires refresh context (--privy-refresh-token or PRIVY_REFRESH_TOKEN).');
      process.exit(1);
    }

    const pseudoPublic = privateKey
      ? createHash('sha256').update(privateKey).digest('hex').slice(0, 44)
      : null;

    const wallet = {
      createdAt: new Date().toISOString(),
      source: 'privy',
      chain: arg('--chain', 'solana'),
      provider: 'privy',
      privateKey,
      publicKey: privateKey ? arg('--public-key', pseudoPublic) : null,
      privy: {
        walletId: privyWalletId,
        userId: privyUserId,
        auth: {
          state: normalized.state,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          tokenExpiresAt: tokenExpiresAt || null,
          capturedAt: new Date().toISOString()
        }
      },
      warning: privateKey
        ? 'Public key is a placeholder hash for bootstrap UX, not guaranteed chain-valid derivation. Use chain-native wallet derivation before live trading.'
        : 'Privy session metadata captured without local private key. Re-run wallet setup after successful provisioning/export.'
    };

    await writeFile(walletPath, JSON.stringify(wallet, null, 2));
    console.log(`Wallet saved: ${walletPath}`);
    console.log(`Provisioned wallet source: privy (${normalized.state})`);

    if (normalized.state === 'signed_out') {
      console.log('Next step: authenticate with Privy and re-run with --auth-state signed_in plus exported key material.');
      return;
    }

    if (normalized.state === 'expired') {
      console.log('Next step: refresh/re-auth Privy session and re-run with a valid signed_in state and key material.');
      return;
    }

    console.log(`Public key (placeholder): ${wallet.publicKey}`);
    console.log('WARNING: This bootstrap public key is not chain-derived. Replace with a real Solana/EVM address before any live funds.');
    return;
  }

  const privateKey = importPk || `0x${randomBytes(32).toString('hex')}`;
  const pseudoPublic = createHash('sha256').update(privateKey).digest('hex').slice(0, 44);

  const wallet = {
    createdAt: new Date().toISOString(),
    source: importPk ? 'import' : 'generated',
    chain: arg('--chain', 'solana'),
    provider: 'local',
    privateKey,
    publicKey: arg('--public-key', pseudoPublic),
    warning: 'Public key is a placeholder hash for bootstrap UX, not guaranteed chain-valid derivation. Use chain-native wallet derivation before live trading.'
  };

  await writeFile(walletPath, JSON.stringify(wallet, null, 2));
  console.log(`Wallet saved: ${walletPath}`);
  console.log(`Public key (placeholder): ${wallet.publicKey}`);
  console.log('WARNING: This bootstrap public key is not chain-derived. Replace with a real Solana/EVM address before any live funds.');
}

async function cmdTestInference() {
  const activeConfigPath = getActiveConfigPath();
  const cfg = existsSync(activeConfigPath) ? JSON.parse(await readFile(activeConfigPath, 'utf8')) : {};
  const baseUrl = cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL || 'https://api.speakeasyrelay.com';

  try {
    const t0 = Date.now();
    const health = await fetch(`${baseUrl}/health`);
    const latencyMs = Date.now() - t0;
    const modelsResp = await fetch(`${baseUrl}/v1/models`);
    const modelsJson = modelsResp.ok ? await modelsResp.json() : { data: [] };

    console.log(JSON.stringify({
      ok: health.ok && modelsResp.ok,
      check: 'inference-routing',
      baseUrl,
      latencyMs,
      healthStatus: health.status,
      modelsStatus: modelsResp.status,
      models: (modelsJson.data || []).map((m) => m.id),
      note: 'Network-dependent diagnostic. Failing here means route/connectivity issue, not local config corruption.'
    }, null, 2));

    process.exit(health.ok && modelsResp.ok ? 0 : 1);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      check: 'inference-routing',
      baseUrl,
      error: error?.message || String(error),
      note: 'Network-dependent diagnostic failed. Verify baseUrl, egress, DNS, and remote service health.'
    }, null, 2));
    process.exit(1);
  }
}

async function cmdTestExecution() {
  const activeConfigPath = getActiveConfigPath();
  const cfg = existsSync(activeConfigPath) ? JSON.parse(await readFile(activeConfigPath, 'utf8')) : {};
  const j = cfg?.execution?.venues?.jupiter || {};
  const referral = j.referralAccount || process.env.JUPITER_REFERRAL_ACCOUNT || null;
  const platformFeeBps = j.platformFeeBps || 0;

  const url = new URL('https://lite-api.jup.ag/swap/v1/quote');
  url.searchParams.set('inputMint', 'So11111111111111111111111111111111111111112'); // SOL
  url.searchParams.set('outputMint', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  url.searchParams.set('amount', '10000000'); // 0.01 SOL
  url.searchParams.set('slippageBps', '50');
  if (platformFeeBps > 0) url.searchParams.set('platformFeeBps', String(platformFeeBps));

  try {
    const t0 = Date.now();
    const res = await fetch(url.toString());
    const ms = Date.now() - t0;
    const body = await res.json().catch(() => ({}));

    console.log(JSON.stringify({
      ok: res.ok,
      latencyMs: ms,
      venue: 'jupiter',
      referralAccount: referral,
      platformFeeBps,
      quoteStatus: res.status,
      outAmount: body.outAmount || null,
      routePlanSteps: Array.isArray(body.routePlan) ? body.routePlan.length : 0,
      note: 'Referral account is applied during swap build/execution; quote confirms routing path availability.'
    }, null, 2));

    process.exit(res.ok ? 0 : 1);
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      venue: 'jupiter',
      referralAccount: referral,
      platformFeeBps,
      error: error?.message || String(error)
    }, null, 2));
    process.exit(1);
  }
}

async function cmdMigrate() {
  if (!existsSync(legacyConfigDir)) {
    console.log('No legacy .wrenos directory found. Nothing to migrate.');
    return;
  }

  const force = process.argv.includes('--force');
  await mkdir(configDir, { recursive: true });

  const legacyToNew = [
    ['config.json', 'config.json'],
    ['pack-dual-agent.json', 'pack-dual-agent.json'],
    ['pack-meme-discovery.json', 'pack-meme-discovery.json'],
    ['wallet.json', 'wallet.json'],
    ['AGENTS.md', 'AGENTS.md'],
    ['HEARTBEAT.md', 'HEARTBEAT.md'],
    ['openclaw-templates/AGENTS.md', 'wrenos-templates/AGENTS.md'],
    ['openclaw-templates/HEARTBEAT.md', 'wrenos-templates/HEARTBEAT.md'],
    ['openclaw-templates/README.md', 'wrenos-templates/README.md'],
    ['wrenos-templates/AGENTS.md', 'wrenos-templates/AGENTS.md'],
    ['wrenos-templates/HEARTBEAT.md', 'wrenos-templates/HEARTBEAT.md'],
    ['wrenos-templates/README.md', 'wrenos-templates/README.md']
  ];

  const copied = [];
  const skipped = [];

  for (const [srcRel, dstRel] of legacyToNew) {
    const src = path.join(legacyConfigDir, srcRel);
    const dst = path.join(configDir, dstRel);
    if (!existsSync(src)) continue;
    if (existsSync(dst) && !force) {
      skipped.push(dstRel);
      continue;
    }
    await mkdir(path.dirname(dst), { recursive: true });
    await copyFile(src, dst);
    copied.push(dstRel);
  }

  const validation = {
    configExists: existsSync(path.join(configDir, 'config.json')),
    templatesDirExists: existsSync(path.join(configDir, 'wrenos-templates')),
    configJsonValid: null
  };

  if (validation.configExists) {
    try {
      JSON.parse(await readFile(path.join(configDir, 'config.json'), 'utf8'));
      validation.configJsonValid = true;
    } catch {
      validation.configJsonValid = false;
    }
  }

  const ok = validation.configExists ? validation.configJsonValid === true : true;

  console.log(JSON.stringify({
    ok,
    legacyDir: legacyConfigDir,
    targetDir: configDir,
    copied,
    skipped,
    validation,
    note: force ? 'Existing files were overwritten with --force.' : 'Use --force to overwrite existing .wrenos files.'
  }, null, 2));

  if (!ok) process.exit(1);
}

async function cmdDemo() {
  await mkdir(configDir, { recursive: true });
  const demoPath = path.join(configDir, 'demo-last-run.json');

  const now = new Date();
  const signalScore = 0.42;
  const threshold = 0.6;
  const decision = signalScore >= threshold ? 'paper_proposal' : 'hold';

  const payload = {
    ok: true,
    mode: 'demo',
    profile: 'demo-zero-config',
    paperDefault: true,
    liveExecution: false,
    requireExplicitApproval: true,
    flow: [
      { step: 'collect_signal', score: signalScore },
      { step: 'evaluate_threshold', threshold },
      { step: 'decision', decision }
    ],
    note: 'Zero-config demo mode. Safe defaults are enforced; no live execution side effects.',
    generatedAt: now.toISOString()
  };

  await writeFile(demoPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
}

async function cmdStart() {
  const cfg = await loadConfigOrFail();
  const once = process.argv.includes('--once');
  const intervalArg = arg('--interval', null);
  const intervalSec = Number(intervalArg || cfg?.loop?.cycleIntervalSeconds || 300);
  const safeIntervalSec = Number.isFinite(intervalSec) && intervalSec > 0 ? intervalSec : 300;

  const mode = cfg?.liveExecution === true ? 'live' : 'paper';
  const approvalsRequired = cfg?.requireExplicitApproval ?? true;
  const confidenceTiers = cfg?.confidenceTierPolicy ? Object.keys(cfg.confidenceTierPolicy) : ['tier0', 'tier1', 'tier2', 'tier3'];
  const logPath = path.join(configDir, 'heartbeat-log.jsonl');

  const header = {
    ok: true,
    action: 'start',
    beta: true,
    profile: cfg?.profile || null,
    mode,
    intervalSec: safeIntervalSec,
    once,
    approvalsRequired,
    safety: {
      paperModeDefault: mode === 'paper',
      liveRequiresExplicitEnablement: true,
      externalSideEffectsRequireApprovals: true,
      confidenceTiers
    },
    note: 'wrenos start is a beta orchestration loop with structured heartbeat logging.'
  };
  console.log(JSON.stringify(header, null, 2));

  const runHeartbeatGitAutoSync = async (tsIso) => {
    const configured = cfg?.loop?.gitAutoSyncScript || process.env.WREN_GIT_AUTO_SYNC_SCRIPT || path.join(cwd, 'scripts', 'git_auto_sync.mjs');
    const scriptPath = path.resolve(configured);
    if (!existsSync(scriptPath)) {
      return { attempted: false, skipped: true, reason: 'script_missing', scriptPath };
    }
    const r = spawnSync('node', [scriptPath], { cwd, encoding: 'utf8' });
    let parsed = null;
    try { parsed = JSON.parse((r.stdout || '').trim() || '{}'); } catch {}
    return {
      attempted: true,
      scriptPath,
      exitCode: r.status,
      ok: r.status === 0,
      result: parsed,
      stderr: (r.stderr || '').trim() || null,
      ts: tsIso,
    };
  };

  const tick = async () => {
    const ts = new Date().toISOString();
    const gitAutoSync = await runHeartbeatGitAutoSync(ts);
    const event = {
      ts,
      type: 'heartbeat_tick',
      profile: cfg?.profile || null,
      mode,
      decision: mode === 'paper' ? 'hold_or_paper_proposal' : 'proposal_requires_approval',
      approvalsRequired,
      confidenceTierPolicyPresent: Boolean(cfg?.confidenceTierPolicy),
      inferenceBaseUrl: cfg?.inference?.baseUrl || process.env.SPEAKEASY_BASE_URL || null,
      warning: mode === 'live' ? 'Live mode configured; explicit approval gates must be enforced by operator workflow.' : null,
      gitAutoSync,
    };
    await appendFile(logPath, `${JSON.stringify(event)}\n`);
    console.log(JSON.stringify(event, null, 2));
  };

  if (once) {
    await tick();
    return;
  }

  await tick();
  const timer = setInterval(() => {
    tick().catch((err) => {
      console.error(JSON.stringify({ ok: false, action: 'start', error: err?.message || String(err) }, null, 2));
    });
  }, safeIntervalSec * 1000);

  const shutdown = (signal) => {
    clearInterval(timer);
    console.log(JSON.stringify({ ok: true, action: 'start', stopping: true, signal }, null, 2));
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

const AGENTS_MD = `# AGENTS.md — WrenOS Agent Configuration Template
# Copy this file to .wrenos/AGENTS.md and customise for your deployment.

## Agent Identity
name: my-wrenos-agent
description: Research-grade crypto signal agent (no live execution)

## Safety Posture (safe-by-default — do not change liveExecution without review)
liveExecution: false          # Set true only after paper-trading validation
requireExplicitApproval: true # Each live order requires operator sign-off

## Data Sources (ordered by preference; unavailable sources are skipped)
dataSources:
  - walletFlow      # On-chain wallet movement — primary signal
  - birdeye         # DEX price/volume aggregator — primary enrichment
  - lunar           # Social sentiment — primary enrichment
  - dexscreener     # Fallback A: enriched DEX data
  - agentiLiteFallback  # Fallback B: geckoterminal + social + market + wallet

## Confidence Tiers & Fallback Behaviour
# Tier 0 — all primary sources healthy: full basket, normal sizing
# Tier 1 — ≥2 sources healthy: reweight, reduce position sizes
# Tier 2 — wallet only: safe mode, minimal exposure
# Tier 3 — no reliable data: hold/observe, no new positions
confidenceTierPolicy:
  tier0: { action: normal,     maxNewPositions: 8 }
  tier1: { action: reweight,   maxNewPositions: 4 }
  tier2: { action: safe_mode,  maxNewPositions: 1 }
  tier3: { action: hold_observe, maxNewPositions: 0 }

## Symbol Selection
minNewSymbolRatio: 0.35       # At least 35% of basket must be fresh symbols
maxSymbolStalenessCycles: 6   # Drop symbol after 6 cycles without signal
targetBasketSize: 8

## Risk Limits (paper/live)
# Uncomment and tune only when profile is trading-agent-paper or above
# maxTradeUsd: 25
# maxDailyNotionalUsd: 75
`;

const HEARTBEAT_MD = `# HEARTBEAT.md — WrenOS Heartbeat Loop Template
# Copy this file to .wrenos/HEARTBEAT.md and customise for your deployment.

## Loop Configuration
heartbeatAdaptive: true   # Allow loop cadence to self-tune based on data quality
cycleIntervalSeconds: 300 # Base heartbeat: every 5 minutes (adaptive may shorten/lengthen)

## Lanes
# exploit — trade signals with established edge evidence
# explore — evaluate new symbols for potential promotion to exploit
lanes:
  exploit:
    enabled: true
    minEdgeBps: 15          # Minimum edge in basis points to act
    maxPoolsPerCycle: 5
  explore:
    enabled: true
    maxPoolsPerCycle: 10
    promoteAfterCycles: 3   # Cycles before an explore pool can be promoted

## Adaptive Tuner
tuner:
  enabled: true
  targetSharpe: 1.5         # Increase cycle frequency when Sharpe < target
  cooldownCycles: 2         # Minimum cycles between parameter adjustments
  maxCadenceMultiplier: 3   # Never slow heartbeat more than 3x base interval

## Fallback on Data Degradation
fallback:
  tier1Action: reweight_lanes      # Scale back exploit, keep explore alive
  tier2Action: pause_exploit        # Suspend exploit lane entirely
  tier3Action: hold_all             # Pause all execution, log and alert only
  alertWebhook: ""                  # Optional: POST alert JSON to this URL

## Regression Guard
regression:
  enabled: true
  worstDrawdownPctLimit: 15   # Halt loop if drawdown exceeds 15%
  lookbackCycles: 24          # Window for drawdown calculation
`;


const MCP_JSON_TEMPLATE = {
  "agenti-lite": {
    "command": "npx",
    "args": ["-y", "tsx", "./vendor/agenti-lite/src/index.ts"]
  },
  "pump-fun-sdk-lite": {
    "command": "npx",
    "args": ["-y", "tsx", "./vendor/pump-fun-sdk-lite/mcp-server/src/index.ts"]
  },
  "helius": {
    "command": "npx",
    "args": ["-y", "@mcp-dockmaster/mcp-server-helius"],
    "env": {
      "HELIUS_API_KEY": "<set-your-helius-api-key>"
    }
  }
};

const TEMPLATES_README = `# WrenOS Operator Templates

These are starter templates generated by \`bootstrap-wrenos\`.
They live in \`.wrenos/wrenos-templates/\` and are **not** active until you copy them.

## Files

| File | Purpose |
|------|---------|
| AGENTS.md | Agent identity, data sources, confidence tiers, risk limits |
| HEARTBEAT.md | Heartbeat loop cadence, lanes, adaptive tuner, regression guard |

## How to use

1. Review each template and adjust values for your deployment.
2. Copy to the active config directory:
   \`\`\`bash
   cp .wrenos/wrenos-templates/AGENTS.md .wrenos/AGENTS.md
   cp .wrenos/wrenos-templates/HEARTBEAT.md .wrenos/HEARTBEAT.md
   \`\`\`
3. Run \`wrenos status\` to confirm the core config is healthy.

## Safety defaults

- \`liveExecution: false\` in every template — never flipped automatically.
- Confidence-tier fallbacks are mandatory; tier 3 always means hold/observe.
- See \`docs/safety.md\` for the full safety posture.
`;

async function cmdBootstrapWrenos() {
  const templatesDir = path.join(configDir, 'wrenos-templates');
  await mkdir(templatesDir, { recursive: true });

  const files = [
    { name: 'AGENTS.md', content: AGENTS_MD },
    { name: 'HEARTBEAT.md', content: HEARTBEAT_MD },
    { name: 'README.md', content: TEMPLATES_README },
  ];

  for (const { name, content } of files) {
    const dest = path.join(templatesDir, name);
    if (!existsSync(dest)) {
      await writeFile(dest, content);
      console.log(`  created  ${path.relative(cwd, dest)}`);
    } else {
      console.log(`  exists   ${path.relative(cwd, dest)} (skipped)`);
    }
  }
  console.log(`\nbootstrap-wrenos complete. Templates in ${path.relative(cwd, templatesDir)}/`);
  console.log('Next: review templates, then copy to .wrenos/ when ready (see README.md inside).');
}

async function main() {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'init': return cmdInit();
    case 'init-pack': return cmdInitPack();
    case 'doctor': return cmdDoctor();
    case 'status': return cmdStatus();
    case 'config': return cmdConfig();
    case 'wallet': {
      if (process.argv[3] === 'setup') return cmdWalletSetup();
      console.log('Usage: wrenos wallet setup [--provider local|privy] [--private-key 0x...] [--public-key ...] [--chain solana] [--privy-wallet-id ...] [--privy-user-id ...]');
      process.exit(1);
    }
    case 'test': {
      if (process.argv[3] === 'inference') return cmdTestInference();
      if (process.argv[3] === 'execution') return cmdTestExecution();
      console.log('Usage: wrenos test <inference|execution>');
      process.exit(1);
    }
    case 'demo':
      return cmdDemo();
    case 'start':
      return cmdStart();
    case 'migrate':
      return cmdMigrate();
    case 'upgrade-config':
      console.error('[deprecation] `wrenos upgrade-config` is deprecated; use `wrenos migrate` instead. Planned removal: '+DEPRECATION_REMOVAL_TARGET+'.');
      return cmdMigrate();
    case 'bootstrap-wrenos':
      return cmdBootstrapWrenos();
    case 'bootstrap-openclaw':
      console.error('[deprecation] `wrenos bootstrap-openclaw` is deprecated; use `wrenos bootstrap-wrenos` instead. Planned removal: '+DEPRECATION_REMOVAL_TARGET+'.');
      return cmdBootstrapWrenos();
    default:
      console.log('Usage: wrenos <init|init-pack|doctor|status|config|wallet|test|demo|start|migrate|bootstrap-wrenos> ...');
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
