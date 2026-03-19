# Privy Wallet Provisioning (WrenOS CLI)

This guide documents the first-class Privy onboarding flow in the WrenOS CLI.

## Command

```bash
wrenos wallet setup --provider privy [options]
```

Key options:
- `--auth-state signed_out|signed_in|expired`
- `--private-key <key>` (required for `signed_in`)
- `--privy-user-id <id>`
- `--privy-wallet-id <id>`
- `--privy-access-token <token>` (optional metadata)
- `--privy-refresh-token <token>` (required when `--auth-state expired`)
- `--privy-token-expires-at <iso8601>`

Environment fallbacks are also supported:
- `PRIVY_WALLET_ID`, `PRIVY_USER_ID`
- `PRIVY_EXPORTED_PRIVATE_KEY`, `AGENT_WALLET_PRIVATE_KEY`
- `PRIVY_AUTH_STATE`, `PRIVY_ACCESS_TOKEN`, `PRIVY_REFRESH_TOKEN`, `PRIVY_TOKEN_EXPIRES_AT`

## State model

### 1) signed_out
Use when the operator has not completed Privy authentication yet.

```bash
wrenos wallet setup --provider privy --auth-state signed_out --privy-user-id user_123
```

Result:
- Persists provider metadata safely
- No private key is written
- CLI prints next-step guidance to complete auth and re-run as `signed_in`

### 2) signed_in
Use when Privy auth is complete and key material is available.

```bash
wrenos wallet setup \
  --provider privy \
  --auth-state signed_in \
  --private-key 0xabc... \
  --privy-user-id user_123 \
  --privy-wallet-id wallet_456
```

Result:
- Stores wallet provider metadata
- Stores key material for runtime usage
- Sets `privy.auth.state` to `signed_in`

### 3) expired
Use when auth/session is expired and recovery is required.

```bash
wrenos wallet setup \
  --provider privy \
  --auth-state expired \
  --privy-refresh-token refresh_abc \
  --privy-user-id user_123
```

Result:
- Captures expired state + refresh context
- Warns operator to refresh/re-auth and re-run as `signed_in`

## Recovery and malformed input handling

- Invalid `--auth-state` fails fast with actionable guidance.
- `signed_in` without key material fails fast.
- `expired` without refresh context fails fast.

## Verification commands

```bash
wrenos doctor
wrenos status
```

`doctor` validates Privy metadata state and highlights malformed state values.
`status` includes wallet provider and `privyAuthState` for operator visibility.
