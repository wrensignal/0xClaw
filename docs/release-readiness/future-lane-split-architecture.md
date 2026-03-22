# Future lane split architecture (hosted Railway now, operator/OpenClaw next)

Status: draft-for-implementation
Owner: Quill
Issue: WRE-153
Last updated: 2026-03-22

## Decision (locked)
WrenOS remains a **single core codebase** (`wrensignal/wrenOS`) with two deployment lanes:

1. **Hosted lane (Railway template)** — current launch lane
2. **Operator lane (OpenClaw/custom runtime)** — next expansion lane

Both lanes consume the same core packages and skills surface; lane-specific behavior is configured through explicit contracts (env/config/docs/test matrix), not forks.

## Lane boundary model

### Shared core (must not drift)
- `packages/core`, `packages/cli`, `packages/loops`, adapters, profiles
- `packs/core-skills-pack`
- canonical schemas in `schemas/`
- release-readiness checks and evidence tooling

### Hosted lane (Railway-first)
- Primary entrypoint: Railway template + one-service import contract
- Opinionated defaults for bootstrap, env minimalism, and paper-mode safety
- Docs path: quickstart-first, lowest-friction hosted setup

### Operator lane (OpenClaw/custom)
- Manual runtime composition and deeper override surface
- Expanded env/config controls and pluggable operator infra
- Docs path: advanced/operator deep path with migration from hosted defaults

## Environment contract split

### Hosted required/primary contract
- minimal required env set for single-service launch
- immutable safe defaults for fail-closed startup
- explicit deny of operator-only knobs in hosted quickstart examples

### Operator required/primary contract
- superset env/config contract with advanced override controls
- explicit sections for runtime topology, custom adapters, and infra auth
- no hidden implicit defaults: all operator knobs documented as source-of-truth

## Docs IA split

### Hosted docs IA (default path)
1. Quickstart (hosted)
2. Env setup (hosted minimal)
3. Verify + smoke
4. Troubleshooting (hosted)

### Operator docs IA (advanced path)
1. Operator architecture overview
2. Runtime composition (OpenClaw/custom)
3. Env and adapter deep config
4. Drift and conformance checks

Cross-link rule:
- hosted docs reference operator path as “advanced/custom”
- operator docs reference hosted path as “fastest baseline”

## Drift guardrails and test matrix updates

We enforce anti-drift through lane-tagged validation:

- `hosted/*` checks validate single-service Railway import assumptions
- `operator/*` checks validate advanced runtime composition assumptions
- `shared/*` checks validate common core behavior

Required matrix policy:
- every new lane-sensitive change must include at least one lane-tagged assertion
- no PR merges lane-specific behavior without corresponding matrix row updates

## Implementation roadmap (post Railway-lane green)

1. Add lane-specific env schema partitions (hosted/operator) with shared base schema
2. Split docs nav/IA to dedicated hosted quickstart and operator deep path
3. Add lane-aware CI jobs (`verify:hosted`, `verify:operator`) built on shared checks
4. Add lane drift report artifact in release readiness evidence

## Non-goals
- No repo split
- No duplicated package trees
- No behavior divergence without explicit lane contract update
