# Example: OpenClaw Solo Trader (Paper)

This example shows single-agent paper trading bootstrap with explicit risk limits.

## Goal

- Use profile `solo-trader-paper`
- Keep trading in paper mode
- Verify execution venue connectivity without live order placement

## Steps

```bash
# from repo root
npm install

# initialize paper trader profile
node packages/cli/src/index.mjs init --profile solo-trader-paper

# set optional overrides
node packages/cli/src/index.mjs config set risk.maxTradeUsd 25
node packages/cli/src/index.mjs config set risk.maxDailyNotionalUsd 75
node packages/cli/src/index.mjs config set execution.venues.jupiter.referralAccount <your_pubkey>

# generate/import wallet scaffold
node packages/cli/src/index.mjs wallet setup
# or
node packages/cli/src/index.mjs wallet setup --private-key 0x...

# run smoke checks
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs test inference
node packages/cli/src/index.mjs test execution
```

## Expected result

- Config is initialized in paper mode
- Inference and execution smoke checks return pass
- No live trading is enabled unless explicitly changed
