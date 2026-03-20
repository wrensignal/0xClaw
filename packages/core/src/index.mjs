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

export const TerminalOutcomes = Object.freeze({
  SUCCESS: 'SUCCESS',
  NO_TRADE: 'NO_TRADE',
  FAILED_SETUP: 'FAILED_SETUP',
  FAILED_CONTRACT: 'FAILED_CONTRACT',
  FAILED_ROUTING: 'FAILED_ROUTING'
});

export const ReasonCodes = Object.freeze({
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_DECISION: 'INVALID_DECISION',
  INVALID_CONFIDENCE: 'INVALID_CONFIDENCE',
  EMPTY_REASONS: 'EMPTY_REASONS',
  INVALID_REASON_ITEM: 'INVALID_REASON_ITEM',
  MANAGED_FAIL_CLOSED: 'MANAGED_FAIL_CLOSED'
});

export function validateExplainabilityContract(payload) {
  if (!payload || typeof payload !== 'object') return { valid: false, reason_code: ReasonCodes.INVALID_INPUT };
  if (!payload.decision || typeof payload.decision !== 'string') return { valid: false, reason_code: ReasonCodes.INVALID_DECISION };
  if (!payload.confidence || typeof payload.confidence !== 'string') return { valid: false, reason_code: ReasonCodes.INVALID_CONFIDENCE };
  if (!Array.isArray(payload.reasons) || payload.reasons.length === 0) return { valid: false, reason_code: ReasonCodes.EMPTY_REASONS };
  if (payload.reasons.some((r) => typeof r !== 'string' || !r.trim())) return { valid: false, reason_code: ReasonCodes.INVALID_REASON_ITEM };
  return { valid: true, value: payload };
}

export function deriveOutcome({ managed = false, setupOk = true, contractOk = true, routingOk = true, executed = false, noTrade = false } = {}) {
  if (!setupOk) return { outcome: TerminalOutcomes.FAILED_SETUP };
  if (!contractOk) return { outcome: TerminalOutcomes.FAILED_CONTRACT };
  if (!routingOk) return { outcome: TerminalOutcomes.FAILED_ROUTING };
  if (noTrade) return { outcome: TerminalOutcomes.NO_TRADE };
  if (executed) return { outcome: TerminalOutcomes.SUCCESS };

  if (managed) {
    return {
      outcome: TerminalOutcomes.FAILED_CONTRACT,
      reason_code: ReasonCodes.MANAGED_FAIL_CLOSED
    };
  }

  return { outcome: TerminalOutcomes.NO_TRADE };
}

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
