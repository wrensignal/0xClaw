function toBool(v, fallback = false) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'on' || v.toLowerCase() === 'true') return true;
    if (v.toLowerCase() === 'off' || v.toLowerCase() === 'false') return false;
  }
  return fallback;
}

function formatAlert(event = {}) {
  const type = event.type || 'event';
  switch (type) {
    case 'discovery_hit':
      return `🔎 Discovery hit: ${event.symbol || 'unknown'} score=${event.score ?? 'n/a'} source=${event.source || 'n/a'}`;
    case 'trade_signal':
      return `📣 Trade signal: ${event.side || 'N/A'} ${event.symbol || 'unknown'} confidence=${event.confidence ?? 'n/a'} mode=${event.paperMode ? 'paper' : 'live'}`;
    case 'heartbeat_alert':
      return `💓 Heartbeat alert [${event.severity || 'info'}]: ${event.message || 'no message'}`;
    case 'performance_report':
      return `📈 Performance ${event.period || 'summary'}: pnlUsd=${event.pnlUsd ?? 'n/a'} winRate=${event.winRate ?? 'n/a'}`;
    default:
      return `ℹ️ ${type}: ${event.message || JSON.stringify(event)}`;
  }
}

export function createTelegramAdapter(config = {}, hooks = {}) {
  const state = {
    paperMode: toBool(config.paperMode ?? true, true),
    alertsEnabled: toBool(config.alertsEnabled ?? true, true)
  };

  const help = [
    'Available commands:',
    '/status',
    '/watchlist',
    '/health',
    '/heartbeat',
    '/performance',
    '/trade <symbol>',
    '/paper on|off',
    '/alerts on|off'
  ].join('\n');

  async function cmdStatus() {
    if (hooks.getStatus) return hooks.getStatus(state);
    return {
      ok: true,
      profile: config.profile || 'unknown',
      paperMode: state.paperMode,
      alertsEnabled: state.alertsEnabled,
      message: 'Agent is online.'
    };
  }

  async function cmdWatchlist() {
    if (hooks.getWatchlist) return hooks.getWatchlist(state);
    return {
      ok: true,
      watchlist: [],
      message: 'No watchlist loaded yet.'
    };
  }

  async function cmdHealth() {
    if (hooks.getHealth) return hooks.getHealth(state);
    return {
      ok: true,
      upstream: config.inferenceBaseUrl || process.env.SPEAKEASY_BASE_URL || 'https://api.speakeasyrelay.com'
    };
  }

  async function cmdHeartbeat() {
    if (hooks.getHeartbeat) return hooks.getHeartbeat(state);
    return {
      ok: true,
      type: 'heartbeat',
      message: 'Heartbeat summary unavailable (no getHeartbeat hook wired).'
    };
  }

  async function cmdPerformance() {
    if (hooks.getPerformance) return hooks.getPerformance(state);
    return {
      ok: true,
      type: 'performance',
      message: 'Performance summary unavailable (no getPerformance hook wired).'
    };
  }

  async function cmdTrade(symbol) {
    if (!symbol) return { ok: false, error: 'usage: /trade <symbol>' };
    if (hooks.proposeTrade) return hooks.proposeTrade({ symbol, paperMode: state.paperMode });
    return {
      ok: true,
      type: 'proposal',
      symbol,
      paperMode: state.paperMode,
      message: `Trade proposal generated for ${symbol}${state.paperMode ? ' (paper mode)' : ''}.`
    };
  }

  async function cmdPaper(mode) {
    if (!mode || !['on', 'off'].includes(String(mode).toLowerCase())) {
      return { ok: false, error: 'usage: /paper on|off' };
    }
    state.paperMode = String(mode).toLowerCase() === 'on';
    if (hooks.onPaperModeChange) await hooks.onPaperModeChange(state.paperMode);
    return {
      ok: true,
      paperMode: state.paperMode,
      message: `Paper mode ${state.paperMode ? 'enabled' : 'disabled'}.`
    };
  }

  async function cmdAlerts(mode) {
    if (!mode || !['on', 'off'].includes(String(mode).toLowerCase())) {
      return { ok: false, error: 'usage: /alerts on|off' };
    }
    state.alertsEnabled = String(mode).toLowerCase() === 'on';
    if (hooks.onAlertsModeChange) await hooks.onAlertsModeChange(state.alertsEnabled);
    return {
      ok: true,
      alertsEnabled: state.alertsEnabled,
      message: `Alerts ${state.alertsEnabled ? 'enabled' : 'disabled'}.`
    };
  }

  async function handleText(text = '') {
    const [cmd, ...rest] = String(text).trim().split(/\s+/);
    const arg = rest.join(' ').trim();
    const normalized = (cmd || '').toLowerCase();

    switch (normalized) {
      case '/status':
        return cmdStatus();
      case '/watchlist':
        return cmdWatchlist();
      case '/health':
        return cmdHealth();
      case '/heartbeat':
        return cmdHeartbeat();
      case '/performance':
        return cmdPerformance();
      case '/trade':
        return cmdTrade(arg);
      case '/paper':
        return cmdPaper(rest[0]);
      case '/alerts':
        return cmdAlerts(rest[0]);
      case '/help':
      case 'help':
        return { ok: true, message: help };
      default:
        if (hooks.defaultChat) {
          return hooks.defaultChat({
            text: String(text),
            state,
            commandLike: normalized.startsWith('/')
          });
        }
        return { ok: true, message: help };
    }
  }

  async function notify(event = {}) {
    if (!state.alertsEnabled) return { ok: true, skipped: true, reason: 'alerts_disabled' };
    const message = formatAlert(event);
    if (hooks.sendAlert) await hooks.sendAlert({ message, event, state });
    return { ok: true, type: event.type || 'event', message };
  }

  return {
    platform: 'telegram',
    commands: ['/status', '/watchlist', '/health', '/heartbeat', '/performance', '/trade <symbol>', '/paper on|off', '/alerts on|off'],
    state,
    handleText,
    notify
  };
}
