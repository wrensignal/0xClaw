# Vendor Trim Manifest (v1 footprint)

Date: 2026-03-19

## Objective
Keep only high-value, supported vendor surface for v1 launch while clearly labeling non-v1/deferred items.

## Inventory + classification

| Vendor surface | Class | v1 decision | Reason |
|---|---|---|---|
| `vendor/agenti-lite` | MCP/data provider | **keep** | Active dependency for discovery/analysis tool paths |
| `vendor/pump-fun-sdk-lite` | MCP/data provider | **keep** | Active dependency for pump.fun monitoring/trading context |
| `vendor/crypto-news-lite` | MCP/data provider | **keep** | Active dependency for narrative/sentiment/news scans |
| `vendor/skills` | Workspace snapshot bundle | **defer** | Not required for core v1 runtime path; retained for optional portability only |

## Keep set (v1 runtime)

- `vendor/agenti-lite`
- `vendor/pump-fun-sdk-lite`
- `vendor/crypto-news-lite`

These are considered supported vendor dependencies for v1 docs and operational guidance.

## Defer/quarantine set

- `vendor/skills`

Quarantine policy:
- Keep directory for optional portability/history.
- Explicitly mark as **deferred / non-v1-critical**.
- Do not treat as required in bootstrap/deploy docs.

## Removed from required-surface claims

Any claim that implied all vendor directories are runtime-critical is now invalid.
Only the keep set above is part of required v1 vendor footprint.

## Verification

- Directory existence check:
  - `vendor/agenti-lite` ✅
  - `vendor/pump-fun-sdk-lite` ✅
  - `vendor/crypto-news-lite` ✅
  - `vendor/skills` ✅ (labeled deferred)
- Reference hygiene:
  - docs updated to point to this keep/defer classification
  - no required-runtime docs depend on `vendor/skills`

## Notes

This manifest supersedes older trim notes that did not classify `crypto-news-lite` and `vendor/skills` explicitly for v1 decisioning.
