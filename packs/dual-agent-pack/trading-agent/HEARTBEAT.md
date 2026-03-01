# HEARTBEAT.md — trading-agent

On each heartbeat:
1. Read latest 1-3 research briefs from inbox
2. Update strategy parameters (bounded drift)
3. Run backtest/regression
4. Emit scoreboard with exploit/explore lanes
5. If regression fails, halt promotion and log reasons

Never hide failures. Include the latest failed metrics in every operator-facing update.
