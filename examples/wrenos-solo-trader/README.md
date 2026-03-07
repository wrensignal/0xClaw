# Example: WrenOS Solo Trader (Paper)

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
wrenos init --profile solo-trader-paper

# set optional overrides
wrenos config set risk.maxTradeUsd 25
wrenos config set risk.maxDailyNotionalUsd 75
wrenos config set execution.venues.jupiter.referralAccount <your_pubkey>

# generate/import wallet scaffold
wrenos wallet setup
# or
wrenos wallet setup --private-key 0x...

# run smoke checks
wrenos doctor
wrenos test inference
wrenos test execution
```

## Expected result

- Config is initialized in paper mode
- Inference and execution smoke checks return pass
- No live trading is enabled unless explicitly changed
