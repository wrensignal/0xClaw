export const confidenceTiers = {
  0: 'normal',
  1: 'reweight',
  2: 'safe_mode',
  3: 'hold_observe'
};

export const fallbackOrder = [
  'primary:wallet+birdeye+lunar',
  'fallbackA:dexscreener_enriched',
  'fallbackB:agenti_geckoterminal_market_social_wallet',
  'fallbackC:safe_mode_or_hold'
];

export const defaultPolicy = {
  liveExecution: false,
  requireExplicitApproval: true,
  minNewSymbolRatio: 0.35,
  maxSymbolStalenessCycles: 6,
  targetBasketSize: 8
};

/**
 * Derive embedded pilot metrics for a managed funnel session.
 * events: [{ step, at, status, terminalOutcome?, noTradeReason? }]
 */
export function deriveManagedFunnelMetrics(sessionId, events = []) {
  const sorted = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const firstTs = sorted[0] ? new Date(sorted[0].at).getTime() : null;

  const decisionEvent = sorted.find((e) => e.step === 'decision' && e.status === 'ok');
  const decisionTs = decisionEvent ? new Date(decisionEvent.at).getTime() : null;
  const timeToDecisionMs = firstTs != null && decisionTs != null ? Math.max(0, decisionTs - firstTs) : null;

  const terminalEvent = [...sorted].reverse().find((e) => typeof e.terminalOutcome === 'string');
  const terminalOutcome = terminalEvent?.terminalOutcome || 'unknown';

  const failedStep = sorted.find((e) => e.status === 'fail' || e.status === 'timeout');
  const dropOffStep = failedStep ? failedStep.step : null;

  const noTradeReasons = sorted
    .filter((e) => e.terminalOutcome === 'no_trade' && e.noTradeReason)
    .map((e) => e.noTradeReason);

  const reasonCounts = noTradeReasons.reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  const topNoTradeReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));

  return {
    sessionId,
    timeToDecisionMs,
    dropOffStep,
    terminalOutcome,
    topNoTradeReasons,
    computedAt: new Date().toISOString()
  };
}
