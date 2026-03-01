# HEARTBEAT.md — research-agent

On each heartbeat:
1. Pull latest signals (wallet/DEX/sentiment)
2. Evaluate data quality and assign confidence tier
3. Produce one brief:
   - summary
   - signals[] with evidence/confidence/invalidation
   - strategy_hooks[]
   - risk_notes[]
   - feed_gaps[]
4. Write brief to `inbox/research-<timestamp>.json`

If no material change, still write a no-new-signal brief with explicit reason.
