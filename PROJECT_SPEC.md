# PROJECT_SPEC.md — WrenOS v1 Execution Plan

_Last updated: 2026-03-18_
_Owner: Quill_
_Source of truth for what exists, what's missing, and what ships for v1._

---

## 1. What WrenOS Is

WrenOS is an open-source control plane for operator-managed crypto agents, currently focused on Solana memecoin research and trading workflows. It follows a paper-first, evidence-first, operator-controlled philosophy.

**Key design values (non-negotiable):**
- Inspectability over magic
- Deterministic testability over vibes
- Evidence and scorecards over unconstrained LLM autonomy
- Reversible / paper-safe defaults over premature live automation
- Operator control is a feature, not a limitation

**Lineage:** WrenOS is the renamed successor to legacy. Use "WrenOS" everywhere new. Legacy `legacy` CLI alias exists for backward compat only.

---

## 2. Repository Layout

```
/Users/clawd/Desktop/Wren/projects/WrenOS/repo/
├── packages/           # Core npm workspace packages
│   ├── adapters/       # Inference, execution, operator interface adapters
│   ├── cli/            # CLI (wrenos / legacy commands)
│   ├── core/           # Policy defaults, safety primitives, shared utils
│   ├── loops/          # Heartbeat planning, validation summaries
│   ├── profiles/       # 7 profile templates (paper-first)
│   └── speakeasy-ai/   # Speakeasy SDK (DEFERRED — not part of v1)
├── packs/
│   ├── core-skills-pack/   # 11 executable trading/research skills (UNCOMMITTED)
│   ├── dual-agent-pack/    # Research + trading agent pack
│   └── meme-discovery-pack/# Meme discovery workflow pack
├── vendor/
│   ├── agenti-lite/        # Social/wallet analytics SDK + MCP
│   ├── crypto-news-lite/   # Free crypto news MCP server
│   ├── pump-fun-sdk-lite/  # Pump.fun SDK + MCP server
│   └── skills/             # 17 reference/guide skills (educational)
├── site/                   # Static landing page (index.html)
├── docs/                   # 12 documentation files
├── examples/               # 3 example configs (paper, research, solo-trader)
├── scripts/                # Build, lint, typecheck, smoke tests
├── .mcp.json               # MCP server wiring (agenti-lite, pump-fun, helius)
└── railway.json            # Railway deployment config (basic)
```

**Important:** `packs/core-skills-pack/` and `.gitignore` changes are LOCAL ONLY — not committed or pushed to GitHub. The first order of business is committing and pushing this work.

---

## 3. Current State Inventory

### Packages (6) — All committed
| Package | Status |
|---------|--------|
| @wrenos/adapters | Committed |
| @wrenos/cli | Committed |
| @wrenos/core | Committed |
| @wrenos/loops | Committed |
| @wrenos/profiles | Committed |
| speakeasy-ai | Committed (DEFERRED — remove from site, not part of v1) |

### Core Skills Pack (11/12) — UNCOMMITTED
All in `packs/core-skills-pack/`, each has a full SKILL.md:

**Category 1: Research Skills**
| Skill | Status | Wraps |
|-------|--------|-------|
| solana-token-discovery | Done | agenti-lite, pump-fun-sdk, crypto-news-lite, Helius, Birdeye |
| pump-fun-monitor | Done | pump-fun-sdk-lite, optional Helius |
| token-deep-dive | Done | agenti-lite, pump-fun-sdk, crypto-news-lite, Helius, Birdeye |
| crypto-news-scanner | Done | crypto-news-lite (49 tools), agenti-lite social, optional LunarCrush |
| whale-tracker | Done | agenti-lite wallet analytics, crypto-news-lite, optional Helius |

**Category 2: Trading Skills**
| Skill | Status | Wraps |
|-------|--------|-------|
| strategy-builder | Done | agenti-lite historical data, walk-forward validation |
| risk-manager | Done | Fail-closed enforcement, per-trade/strategy/portfolio controls |
| trailing-stop | Done | Tiered exits, take-profit ladders, 4 templates |
| portfolio-optimizer | MISSING | Parameter tuning, allocation optimization — not yet written |

**Category 2b: Utility Skills**
| Skill | Status | Wraps |
|-------|--------|-------|
| solana-token-scan | MISSING | Drop a contract address → rich analytics from all research tools/skills. Single-entry-point lookup combining token-deep-dive, whale-tracker, pump-fun-monitor, and crypto-news-scanner data into one comprehensive report. |

**Category 3: Infrastructure Skills**
| Skill | Status | Wraps |
|-------|--------|-------|
| heartbeat-monitor | Done | Feed health, strategy zoo, portfolio state, agent infra |
| performance-report | Done | Daily/weekly PnL, per-strategy breakdown |
| signal-pipeline | Done | Research → trading handoff, schema validation, routing |

### Vendor Skills (17) — Committed
Educational/reference guides in `vendor/skills/`. Not executable skills — these are knowledge documents for agents.

### MCP Servers (3 wired) — Committed
- agenti-lite (social/wallet analytics)
- pump-fun-sdk-lite (Solana launchpad)
- helius (Solana RPC + enriched data, needs API key)

### Profiles (7) — Committed
meme-discovery-research, meme-discovery-trading-paper, research-agent, research-only, solo-trader-paper, trading-agent-live-disabled, trading-agent-paper

---

## 4. What Must Ship for v1

Traceability matrix: `docs/release-readiness/v1-traceability-matrix.md`


### DONE (needs commit + push)
- [x] 11/12 core skills written with SKILL.md docs
- [x] .gitignore updated for OpenClaw workspace files

### TODO — Must-Have

#### A. Commit and push existing work
The core-skills-pack and .gitignore changes need to be committed and pushed to GitHub. This is blocking everything else.

#### B. Write portfolio-optimizer skill
The 12th and final skill. Should handle:
- Parameter tuning across strategies (multi-window backtesting)
- Allocation weight optimization
- Regime-aware rebalancing
- Risk-return frontier optimization
- Output: recommended allocation weights + tuned parameters

#### C. Root SKILL.md
The site implies this exists but it doesn't. Must contain:
- What WrenOS is
- How an agent should interpret the repo
- How to bootstrap locally
- What is stable vs beta
- Where packs/profiles/skills live
- What safety rules are non-negotiable

#### D. Write solana-token-scan skill
User drops a Solana contract address → returns rich analytics combining all research tools. Single entry point that orchestrates token-deep-dive, whale-tracker, pump-fun-monitor, and crypto-news-scanner into one comprehensive report. This is the "what does this token look like?" skill.

#### E. Remove Speakeasy from site and defer
Speakeasy integration is not part of v1. Remove Speakeasy references from the landing page (content change only, no design changes). The `speakeasy-ai` package stays in the repo but is not promoted or required.

#### F. Docs site maintenance
The docs site at wrenos.ai/docs already exists. Quill should assign tasks to update it as the codebase changes — new skills, CLI changes, profile updates, etc. Key pages to keep current:
- Quick Start
- Safety Posture
- CLI Reference
- Skills Catalog
- Profile Matrix
- Deployment Guide

#### G. Align site/repo naming cleanup
- Remove remaining legacy links from site
- Make WrenOS canonical everywhere public
- Site currently has some legacy routing

#### H. Align vendored components with bootstrap wiring
.mcp.json wires 3 servers but not all vendored components are auto-configured. Either wire them or stop implying they work out of the box.

### TODO — Should-Have

#### I. Privy wallet provisioning
Implement the Privy onboarding flow for auto-wallet creation. Users shouldn't need to manually set up Solana wallets. This is a key UX gap for v1.

#### J. Telegram integration
Not currently live. Needs implementation for:
- Alert delivery (discovery hits, trade signals, heartbeat alerts)
- Performance report delivery
- Operator command interface
- Integration with heartbeat-monitor and performance-report skills

#### K. Railway deployment wrapper
Current railway.json is basic config. Senpi-level would include:
- First-run onboarding flow
- Persistent storage assumptions
- Proxy/gateway behavior
- Auth/token handling
- Workspace bootstrap files
- Telegram wiring
- Security model docs

#### L. Performance claims on site
Backtest data exists ($11.9k / 23.87% / 175 trades) but isn't surfaced publicly. Add a performance section to the landing page (content change only — no design changes to site).

#### M. MCP server exposing WrenOS capabilities
Senpi built 44 purpose-built MCP tools. WrenOS consumes MCPs but doesn't expose its own capabilities (discovery, scoring, risk management, backtesting) as MCP tools for other agents.

#### N. Profile matrix documentation
7 profiles exist but need clear docs: goal, data sources, risk posture, execution posture, intended user, paper/live status.

#### O. Smoke/regression tests for bootstrap
Especially: init, pack setup, .mcp.json generation, inference testing, execution testing, Railway deploy assumptions.

### TODO — Could-Have (v1.1+)

#### P. Community/registry contribution model
Contribution templates, validation tooling, publish flow, featured/verified skills.

---

## 5. GitHub vs Local Delta

| Item | Local | GitHub |
|------|-------|--------|
| HEAD commit | 9ce3f20 | 9ce3f20 (same) |
| packs/core-skills-pack/ | EXISTS (11 skills) | NOT PRESENT |
| .gitignore (OpenClaw entries) | Modified | Old version |
| docs/rebrand-audit.md | Modified (1 line) | Old version |
| docs/rebrand-final-audit.md | Modified (1 line) | Old version |
| PROJECT_SPEC.md | Local-only planning file | Not on GitHub |
| .openclaw/ | Local runtime metadata | Not on GitHub |

**Priority 1:** Commit and push the core-skills-pack and .gitignore changes.

**Heartbeat verification (2026-03-17):**
- `npm test` passes across workspaces (CLI + speakeasy-ai test suites green)
- `packs/core-skills-pack/` present with 11 skills; missing `portfolio-optimizer` and `solana-token-scan`
- Vendor skill directory count is **17** (not 18)

---

## 6. Architecture Notes

### Three-layer model
1. **Open-source control plane** — CLI, profiles, packs, adapters, loops, vendored capabilities
2. **Hosted/optional runtime infra** — Railway for deploy, Privy for wallet provisioning
3. **Operator workflows** — Human approvals, paper/live boundaries, heartbeats, inspections

### Speakeasy (DEFERRED)
The `speakeasy-ai` package exists in the repo but Speakeasy is not part of v1. Remove references from the site. The package stays for future use but is not promoted or required for any v1 workflow.

### Site rules
- **Content changes are fine** (text, copy, adding sections, removing Speakeasy references)
- **Do NOT make design changes** (layout, styling, visual structure). Design work goes to Quill.

### Paper-first posture
- `liveExecution = false` by default
- Explicit approval requirements
- Confidence/fallback tiering
- Hold/observe when data quality is weak
- DO NOT compromise this for launch optics

---

## 7. Key URLs & References

### WrenOS
- **GitHub repo**: https://github.com/wrensignal/wrenOS (this repo)
- **Live site**: https://www.wrenos.ai/
- **Docs site**: https://www.wrenos.ai/docs
- **GitHub org**: https://github.com/wrensignal

### Senpi (packaging benchmark — study their structure)
- **Site**: https://senpi.ai/
- **GitHub org**: https://github.com/Senpi-ai
- **Skills catalog** (the model to follow): https://github.com/Senpi-ai/senpi-skills — real user-facing installable skills with SKILL.md, scripts/, references/, cron guidance, stateful behavior
- **Developer/registry framework**: https://github.com/Senpi-ai/senpi-agent-skills — separate dev-facing framework for building/publishing skills
- **Railway wrapper product**: https://github.com/Senpi-ai/senpi-hyperclaw-railway-template — true one-click deploy with proxy, onboarding, auth, Telegram, persistence

### Local paths
- **This workspace**: `/Users/clawd/Desktop/Wren/projects/WrenOS/repo`
- **Site source**: `site/` (in this repo)
- **Paperclip API**: `http://127.0.0.1:3100` (issue board, agent management)
- **OpenClaw gateway**: `ws://127.0.0.1:18789`

---

## 8. Competitive Context

**Senpi** is the packaging benchmark. They've separated:
1. End-user installable skills (senpi-skills repo) — **study this closely for skill packaging patterns**
2. Developer/registry framework (senpi-agent-skills repo)
3. One-click Railway wrapper product (senpi-hyperclaw-railway-template)

WrenOS has stronger control-plane internals but Senpi is ahead in installability, deployability, and end-user onboarding. The v1 goal is to close this gap.

When implementing skills, Railway templates, or deployment flows — check Senpi's repos first to understand the bar for packaging quality.

---

## 9. Working Rules for Quill

- Read issues fully before starting work
- Check existing code patterns before writing new ones
- Run tests after changes (`npm test`)
- Commit with clear messages, small PRs
- Do NOT push directly to `main`. Work on a feature branch, push autonomously, create PRs to `main`. Scott reviews and merges. No approval needed to push or create PRs.
- Do NOT touch trading pipeline code (Rook/Scout domain)
- Do NOT modify safety defaults or paper-first posture
- If blocked, mark issue as blocked with a comment explaining why

---

## 10. Spec Maintenance & Self-Directed Work

### Heartbeat loop (every 1 hour)
Paperclip auto-wakes Quill on a 1-hour heartbeat cycle. On each heartbeat:
1. Read this PROJECT_SPEC.md
2. Check recently completed Paperclip issues — verify work landed, update spec
3. Scan repo for drift (missing files, broken wiring, build errors, stale docs)
4. Create/update/close Paperclip issues from spec TODO list — the spec IS the backlog
5. Update this file with current state, then go back to sleep

Heartbeat runs are **planning/review only** — no heavy coding. If work is needed, create an issue.

See `HEARTBEAT.md` for the full heartbeat protocol.

### Issue dispatch sessions
When Paperclip dispatches Quill on a specific issue:
1. **Start**: Read this PROJECT_SPEC.md. Check the issue aligns with spec priorities.
2. **During work**: Note any drift, bugs, missing pieces, or new requirements discovered.
3. **End**: Update this file with status changes. Create follow-up Paperclip issues for anything that needs separate work.

### Subagent delegation
When breaking down work:
- **Engineering tasks** (code, skills, CLI, tests): Keep or assign to Paperclip sub-agents
- **Design tasks** (site layout, visual changes, UX): Quill handles directly
- **Content tasks** (site copy, docs text, Speakeasy removal): Quill handles directly
- **Doc updates** (wrenos.ai/docs): Quill handles directly

### Task creation from spec
Quill proactively creates Paperclip issues from this spec's TODO list. Don't wait for Scott to manually create every task. Break items into actionable issues and self-assign or delegate.

---

_This file lives in the WrenOS repo root (gitignored via OpenClaw workspace files). Quill maintains it as a living document._
