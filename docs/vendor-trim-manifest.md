# Vendor Trim Manifest (runtime-safe)

Date: 2026-03-03

## Objective
Trim non-runtime vendor fat while preserving tool/runtime paths used by 0xClaw and OpenClaw agent workflows.

## Scope
- `vendor/pump-fun-sdk-lite`
- `vendor/agenti-lite`

## Kept (runtime/tooling)
- Core source/runtime code (`src/**`)
- MCP server implementation paths (`mcp-server/src/**`, `mcp-server/api/**`)
- Package metadata required for use (`package.json`, lockfiles, license/notice, server manifests)
- Rook-specific helper scripts removed from vendor bundle for generic distribution.

## Removed (non-runtime)
### pump-fun-sdk-lite
- Community and repo management files (`.github/**`, `.vscode/**`, `.well-known/**`)
- Upstream docs/tutorials/prompts (`docs/**`, `tutorials/**`, `prompts/**`)
- Test and security audit trees (`tests/**`, `security/**`, `tools/**`, `typescript/**`)
- Misc non-runtime files (`offline.html`, `llms*.txt`, contributor/governance/changelog/roadmap style docs)

### agenti-lite
- Test files (`**/*.test.ts`, `src/x402/__tests__/**`)
- Non-runtime helper scripts (`scripts/**`, including prior rook-specific helpers)
- Formatting/meta docs (`README.md`, `VENDOR_NOTES.md`, prettier/editor metadata)

## Result
- Removed tracked files: **235**
- Approx tracked payload reduced: **~3.28 MB**

## Verification
- Adapters import smoke: inference/execution/telegram exports still load.
- Clean install smoke: `bash scripts/install.sh` still succeeds in a fresh temp copy.

## Notes
This trim was intentionally conservative on runtime code. If desired, a second pass can further reduce footprint by pruning unused runtime modules after explicit tool-level call tracing.
