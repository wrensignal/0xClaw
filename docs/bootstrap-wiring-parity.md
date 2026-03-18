# Bootstrap Wiring Parity (Vendored Components)

This document records bootstrap wiring decisions so `.mcp.json` behavior and docs stay aligned.

## Current bootstrap behavior

`wrenos init` and `wrenos init-pack` generate `.mcp.json` with a **starter set**:

- `agenti-lite` (auto-wired)
- `pump-fun-sdk-lite` (auto-wired)
- `helius` (auto-wired, API key placeholder)

## Vendored component decisions

| Component | Decision | Rationale |
|---|---|---|
| `vendor/agenti-lite` | auto-wire | Core market/on-chain surface used by default workflows |
| `vendor/pump-fun-sdk-lite` | auto-wire | Core pump.fun lifecycle tooling |
| `@mcp-dockmaster/mcp-server-helius` | auto-wire | Common Solana RPC path with key placeholder |
| `vendor/crypto-news-lite` | manual wiring | Optional workload/profile-specific; avoid extra startup surface by default |
| Other vendored capabilities | manual wiring | Keep bootstrap minimal, deterministic, and operator-explicit |

## Policy

- Docs must not imply that all vendored components are enabled automatically.
- Site/README/CLI copy should describe starter wiring as the default.
- Additional vendored components are opt-in via explicit `.mcp.json` edits.
