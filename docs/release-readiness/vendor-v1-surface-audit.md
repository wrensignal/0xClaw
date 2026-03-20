# WRE-101 Vendor Surface Audit (Keep / Remove / Defer)

Date: 2026-03-19

## Goal
Curate vendor + MCP surface for v1 by classifying inventory and ensuring docs only depend on required surfaces.

## Inventory classification

| Item | Type | Decision | Rationale |
|---|---|---|---|
| `vendor/agenti-lite` | vendor MCP/data source | keep | required in active research/analysis pipelines |
| `vendor/pump-fun-sdk-lite` | vendor MCP/data source | keep | required for pump.fun monitoring/trading context |
| `vendor/crypto-news-lite` | vendor MCP/data source | keep | required for narrative/news scanning |
| `vendor/skills` | vendored workspace bundle | defer | optional portability snapshot, not required for core v1 runtime |

## Keep set (required v1)
- agenti-lite
- pump-fun-sdk-lite
- crypto-news-lite

## Defer set (explicitly non-v1-critical)
- vendor/skills

## Remove set
- None in this pass (no deletions required to satisfy v1 footprint); deferred items are clearly labeled instead.

## Docs updates completed
- Updated `docs/vendor-trim-manifest.md` with explicit keep/defer table.
- Updated `docs/wrenos-mcp-surface.md` to reflect required vs deferred vendor surfaces.
- Added deferred label in `vendor/skills/README.md`.

## Broken-reference check
- Verified referenced vendor directories exist.
- Verified docs no longer imply `vendor/skills` is required for v1 runtime.

## Acceptance mapping
- ✅ Inventory vendor/skills and vendor MCP sources
- ✅ Classify keep/remove/defer with reasons
- ✅ Quarantine non-v1 item via explicit deferred labeling (`vendor/skills`)
- ✅ Update docs/vendor-trim-manifest.md and MCP surface docs
- ✅ Verify no broken references remain
