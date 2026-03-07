# WrenOS

WrenOS is a **crypto agent control plane**: safe-by-default, inspectable, paper-first, and operator-oriented.

It is OpenClaw-compatible and can run with hosted-default or self-hosted infrastructure.

> This project was previously known as **0xClaw**. See `docs/migrating-from-0xclaw-to-wrenos.md` for migration details.
> Legacy `0xclaw` CLI + `.0xclaw` config compatibility is supported during the migration window (planned removal: **v0.3.0**).

## What this repo is

- WrenOS CLI + inspectable file-based configuration for operator workflows
- WrenOS profiles, packs, loops, and adapters
- hosted-default routing (Speakeasy), fully self-hostable overrides
- reproducible paper-first control-plane patterns

## WrenOS pipeline (evidence-first)

WrenOS is designed around a technical loop:

1. **discover** market/research inputs
2. **score** candidates with explicit signals
3. **validate** via gating and safety constraints
4. **execute** in paper mode first (live only by explicit approval)

Every stage is inspectable through config and generated artifacts.

## What is usable today vs experimental vs planned

| Status | Surface |
|---|---|
| **Usable today** | `wrenos init`, `doctor`, `status`, `config`, `wallet setup`, `test inference`, `test execution`, `init-pack`, `bootstrap-wrenos` |
| **Usable today** | `packages/core`, `packages/loops`, `packages/profiles`, `packages/adapters`, `packages/speakeasy-ai` |
| **Experimental** | Turnkey Telegram-agent UX templates and pack conventions |
| **Planned** | `wrenos start` orchestration command (not shipped yet) |

## Clone and install

```bash
git clone https://github.com/wrensignal/wrenOS.git
cd wrenOS
npm install
```

## Quick start

```bash
wrenos init --profile research-agent
wrenos doctor
wrenos status
```

## End-to-end happy path (paper-first)

Concrete flow: discovery input → validation/gating → paper decision → audit log

```bash
node examples/wrenos-paper-happy-path/run.mjs
cat examples/wrenos-paper-happy-path/out/paper-decision-log.json
```

## CLI highlights

```bash
wrenos init --profile research-agent
wrenos config set inference.baseUrl https://api.speakeasyrelay.com
wrenos wallet setup
wrenos init-pack --pack meme-discovery
wrenos test inference
wrenos test execution
wrenos bootstrap-wrenos
```

Legacy alias support (temporary):
- `0xclaw ...` still works
- `.0xclaw/config.json` is read if `.wrenos/config.json` is absent

Migration command for existing operators:
```bash
wrenos migrate
# or, to overwrite existing .wrenos files:
wrenos migrate --force
```

## Safety posture

- `liveExecution: false` by default
- explicit approvals required for external side effects
- confidence-tier fallback behavior is mandatory
- inspectable JSON/Markdown outputs for auditability

## Package map

- `packages/core` — policy defaults, fallback semantics
- `packages/adapters` — inference/execution/telegram adapters + quality tier logic
- `packages/loops` — heartbeat + scorecard primitives
- `packages/cli` — operator commands
- `packages/profiles` — starter templates
- `packages/speakeasy-ai` — OpenAI-compatible client with built-in x402 flow

## Scripts

```bash
npm run build
npm run test
npm run lint
npm run typecheck
```

## Docs

- `docs/quickstart.md`
- `docs/safety.md`
- `docs/speakeasy-integration.md`
- `docs/migrating-from-0xclaw-to-wrenos.md`
- `docs/migration-0xclaw-to-wrenos.md` (legacy alias doc)
- `CHANGELOG.md`

## Landing page prototype

A first-pass marketing site is available at:

- `site/index.html`

Open it locally in your browser to preview.

## License

Apache-2.0
