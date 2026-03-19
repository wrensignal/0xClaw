---
name: wrenos-repo-bootstrap
description: "Root repository skill for WrenOS operators/contributors. Encodes repo orientation, safe execution boundaries, paper-first defaults, custody non-goals, and troubleshooting for bootstrap/runtime setup."
---

# WrenOS Repository Bootstrap Skill (v1)

Use this file as the **first-read contract** before changing code or running operator flows.

## 1) What WrenOS Is

WrenOS is an open-source control plane for operator-managed crypto agents.

Core lifecycle:
1. discover
2. score
3. validate
4. execute (**paper-first by default**)

Design intent:
- explicit operator control
- inspectable config/artifacts
- safety-first defaults
- auditable, approval-aware workflows

## 2) Hard Safety Boundaries (Non-negotiable)

1. `liveExecution` defaults to `false` and should remain off unless explicitly enabled.
2. Never assume execution authority; operator intent must be explicit.
3. Do not bypass risk controls, kill-switches, or safety policy checks.
4. If data quality/confidence degrades, fail-safe to hold/watch/no-op behavior.
5. Prefer reversible, auditable changes over implicit automation.

## 3) Custody Boundaries & Non-goals

WrenOS is **not** a custody system or key-management vault.

Non-goals:
- no hidden key custody behavior
- no implied wallet authorization from config presence alone
- no silent transition from paper to live execution
- no autonomous capital deployment without explicit operator enablement

Operator responsibilities:
- provide credentials/keys intentionally
- validate environment/profile before enabling live paths
- review execution posture via `doctor` and `status`

## 4) Canonical Bootstrap (Existing Commands Only)

From repo root:

```bash
npm install
node packages/cli/src/index.mjs init --profile research-agent
node packages/cli/src/index.mjs doctor
node packages/cli/src/index.mjs status
```

Optional setup helpers:

```bash
node packages/cli/src/index.mjs init-pack --pack meme-discovery
node packages/cli/src/index.mjs bootstrap-wrenos
```

Command surface (current):

```bash
wrenos <init|init-pack|doctor|status|config|wallet|test|start|migrate|bootstrap-wrenos>
```

## 5) Repo Structure (Reality Map)

- `packages/`
  - `cli` (operator control surface)
  - `core` (policy defaults/fallbacks)
  - `profiles` (profile templates)
  - `loops` (heartbeat and orchestration primitives)
  - `adapters` (inference/execution/operator interfaces)
- `packs/` (skill packs, incl. `core-skills-pack`)
- `docs/` (architecture, safety, deploy, runbooks)
- `examples/` (paper-first templates)
- `vendor/` (vendored integrations and MCP-adjacent components)

## 6) Stable vs Evolving Surfaces

Stable baseline:
- CLI lifecycle commands listed above
- profile/template initialization flow
- file-based inspectable config behavior
- paper-first safety posture

Evolving surfaces:
- loop orchestration details under `start`
- integration ergonomics for adapters/vendor tooling
- pack-level workflows and contribution affordances

When uncertain: choose conservative/stable path and document assumptions.

## 7) Troubleshooting (MCP / Env / Bootstrap)

### A) `doctor` reports config missing
- Cause: `.wrenos/config.json` not initialized
- Fix:
  ```bash
  node packages/cli/src/index.mjs init --profile research-agent
  node packages/cli/src/index.mjs doctor
  ```

### B) MCP wiring missing (`.mcp.json`)
- Cause: bootstrap/init not executed in current workspace
- Fix:
  ```bash
  node packages/cli/src/index.mjs init --profile research-agent
  node packages/cli/src/index.mjs status
  ```

### C) Wallet/provider setup confusion
- Use explicit provider setup (`wallet setup`) and confirm with:
  ```bash
  node packages/cli/src/index.mjs doctor
  node packages/cli/src/index.mjs status
  ```
- Keep live execution disabled unless all checks pass and operator intends live mode.

### D) One-shot loop (`start --once`) fails
- Run:
  ```bash
  node packages/cli/src/index.mjs doctor
  node packages/cli/src/index.mjs status
  ```
- Resolve reported check failures, then retry:
  ```bash
  node packages/cli/src/index.mjs start --once --interval 1
  ```

## 8) Working Contract for Contributors

Before changes:
- identify stable vs evolving surface touched
- verify safety/custody implications
- prefer narrow, auditable diffs

After changes:
- run verification (`npm test` and/or targeted smoke checks)
- summarize what changed + why
- include explicit safety impact note in PR/issue completion evidence

This file is the authoritative bootstrap orientation for WrenOS repository work.
