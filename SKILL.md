---
name: wrenos-repo-bootstrap
description: "Root repository skill for WrenOS contributors/operators. Defines what WrenOS is, how to bootstrap locally, stable vs beta boundaries, pack/profile layout, and non-negotiable safety rules."
---

# WrenOS Repository Bootstrap Skill

This is the root skill for this repository. Use it as the first orientation pass before making changes.

## What WrenOS Is

WrenOS is an open-source control plane for operator-managed crypto agent systems.

Core loop:
- discover
- score
- validate
- execute (paper-first)

WrenOS emphasizes:
- explicit operator control
- inspectable config and artifacts
- safe defaults (`liveExecution: false`)
- approval-gated external effects

## Local Bootstrap Flow

From repository root:

```bash
npm install
wrenos init --profile research-agent
wrenos doctor
wrenos status
```

Optional first-run setup:

```bash
wrenos init-pack --pack meme-discovery
wrenos bootstrap-wrenos
```

Generated files/directories to know:
- `.wrenos/config.json` (or active config path)
- `.wrenos/wrenos-templates/`
- `.mcp.json` (starter MCP wiring)

## Stable vs Beta Boundaries

### Stable (expected baseline)
- CLI lifecycle: `init`, `doctor`, `status`, `config`, `wallet setup`, `test inference`, `test execution`, `init-pack`, `bootstrap-wrenos`, `migrate`
- profiles/templates under `packages/profiles`
- core safety posture and inspectable file-based config behavior

### Beta / Evolving
- `wrenos start` orchestration loop behavior
- broader adapter integration surface and some pack ergonomics
- rapid iteration areas in vendored integrations and operator workflows

When uncertain, prefer conservative/stable paths and document assumptions.

## Repo Layout (Operator-Facing)

- `packages/`
  - `cli` (control surface)
  - `core` (policy defaults/fallback semantics)
  - `profiles` (operator profile templates)
  - `loops` (heartbeat/scorecard primitives)
  - `adapters` (inference/execution/operator interfaces)
- `packs/`
  - skill packs (including `core-skills-pack`)
- `docs/`
  - architecture, safety, quickstart, migration
- `examples/`
  - paper-first examples
- `vendor/`
  - vendored dependencies and MCP-related components

## Pack/Profile Layout

Profiles:
- template JSON files under `packages/profiles/templates/`
- selected via `wrenos init --profile <name>`

Packs:
- pack content under `packs/`
- initialized via `wrenos init-pack --pack <name>`

MCP starter wiring:
- generated `.mcp.json` includes starter servers (agenti-lite, pump-fun-sdk-lite, helius)
- additional vendored components are manual opt-in via `.mcp.json` edits

## Non-Negotiable Safety Rules

1. Paper-first by default.
2. Never assume live execution is allowed.
3. External side effects require explicit approvals.
4. If confidence/data quality degrades, prefer hold/watch/avoid posture.
5. Keep config and behavior inspectable; avoid hidden automation.
6. Do not bypass operator risk controls or kill-switch semantics.
7. Prefer small, auditable changes over broad implicit behavior changes.

## Working Contract for Contributors

Before changes:
- read relevant docs and existing patterns
- identify stable vs beta surface touched

After changes:
- run verification (`npm test` or targeted checks)
- summarize what changed and why
- call out any safety implications explicitly

This root skill is the canonical bootstrap context for repo-level work.