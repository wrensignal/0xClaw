# v1 Traceability Matrix (PROJECT_SPEC → Code/Test/Docs)

_Last updated: 2026-03-18_
_Source: `PROJECT_SPEC.md` sections 4 and 5_

This matrix maps each v1 requirement to its current implementation location, evidence, owner, and delivery status.

Status legend:
- **complete**: requirement delivered and evidenced
- **partial**: meaningful progress exists, but requirement not yet fully complete
- **missing**: not implemented yet

## Must-Have Requirements

| Req ID | Requirement | Implementation location(s) | Test/verification evidence | Owner | Status |
|---|---|---|---|---|---|
| A | Commit and push existing work (core-skills-pack + .gitignore updates) | `packs/core-skills-pack/`, `.gitignore` | `git status`, commit history, remote branch/PR check | Quill | partial |
| B | Write `portfolio-optimizer` skill | `packs/core-skills-pack/portfolio-optimizer/` (expected) | Skill lint/check + usage validation in docs/examples | Quill | missing |
| C | Add root `SKILL.md` with orientation/safety/bootstrap boundaries | `SKILL.md` (repo root) | Manual audit against checklist in PROJECT_SPEC | Quill | partial |
| D | Write `solana-token-scan` skill (single-entry token intelligence) | `packs/core-skills-pack/solana-token-scan/` (expected) | Skill execution sample + output contract check | Quill | missing |
| E | Remove Speakeasy from site messaging (defer for v1) | `site/` content + related docs references | Content diff review + site smoke checks | Quill | partial |
| F | Keep docs site in sync with codebase changes | `docs/` + docs publishing surfaces | Section-by-section parity checks | Quill | partial |
| G | Naming cleanup (0xClaw → WrenOS) across public surfaces | `site/`, `docs/`, links/meta | Link sweep + broken-link checks | Quill | partial |
| H | Align vendored components with bootstrap wiring (`.mcp.json`) | `.mcp.json`, `vendor/`, docs | `doctor` diagnostics + startup probes | Quill | partial |

## Should-Have Requirements

| Req ID | Requirement | Implementation location(s) | Test/verification evidence | Owner | Status |
|---|---|---|---|---|---|
| I | Privy wallet provisioning flow | `packages/cli`, `packages/adapters`, docs | Auth-state tests (signed-out/signed-in/expired/malformed) | Quill | missing |
| J | Telegram integration (alerts/reports/operator commands) | `packages/adapters`, skills wiring, docs | Integration smoke tests + sample message evidence | Quill | missing |
| K | Railway deploy wrapper parity | `railway.json`, deploy scripts/docs | Post-deploy health checks + bootstrap smoke | Quill | partial |
| L | Add performance claims section to site (content-only) | `site/index.html` | Content review + source/evidence mapping | Quill | missing |
| M | Expose WrenOS capabilities as MCP tools | MCP server package(s) (expected), docs | Tool listing + invocation tests | Quill | missing |
| N | Profile matrix documentation | `docs/profile-matrix.md` | Profile intent/capability/constraints cross-check | Quill | partial |
| O | Bootstrap/regression smoke tests | `scripts/`, test suites, CI wiring | CI/`npm test`/smoke artifacts | Quill | partial |

## Could-Have (v1.1+)

| Req ID | Requirement | Implementation location(s) | Test/verification evidence | Owner | Status |
|---|---|---|---|---|---|
| P | Community/registry contribution model | contribution docs/templates, validation tooling | Contributor dry-run from clean clone | Quill | missing |

## Gaps discovered outside spec

| Gap ID | Gap | Impact | Suggested follow-up issue |
|---|---|---|---|
| X1 | Agent identity/API key drift across wake runs can result in wrong-agent behavior | High — can cause incorrect issue mutation or auth failures | Add identity preflight guard in wake workflow (hard fail if `agents/me.id` != expected) |
| X2 | Completion evidence quality was inconsistent across prior issue closures | High — false `done` status risk | Enforce mandatory completion templates + evidence validator before `done` patch |
| X3 | Site/docs drift appears repeatedly due to parallel edits without reproducible baseline discipline | Medium/High — regressions and review churn | Keep baseline freeze + cleanup gate as prerequisite for content tasks |
| X4 | Legacy naming remnants (`0xClaw`) persist in public-facing paths and metadata | Medium — trust/consistency risk | Run dedicated naming/link hygiene sweep with automated checks |

## Notes

- This file is the traceability hub for v1 planning and execution.
- As issues close with PR evidence, update status from `partial/missing` to `complete` and attach proof links.
