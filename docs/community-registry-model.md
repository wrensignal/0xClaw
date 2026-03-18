# Community / Registry Contribution Model (v1.1)

This document defines the proposed contribution and publishing model for community WrenOS skills.

## Goals

- Make skill contributions easy and repeatable.
- Enforce baseline quality and safety before publish.
- Support transparent discovery signals (`community`, `verified`, `featured`).
- Keep publishing auditable and reversible.

## Contribution Templates

Use the following templates for every skill submission:

1. **Skill Submission Template** (`docs/templates/skill-submission.md`)
   - skill purpose and scope
   - required inputs/outputs
   - dependencies and env vars
   - safety constraints
   - sample prompts

2. **Validation Checklist** (`docs/templates/skill-validation-checklist.md`)
   - schema + lint checks
   - dependency/path checks
   - safety and fallback checks
   - documentation completeness

Maintainers should require both artifacts in every registry-bound PR.

## Validation Tooling

Proposed command surface:

```bash
npm run skills:lint
npm run skills:validate
npm run skills:pack
```

Validation gates:

- **Structure**: required frontmatter keys and SKILL.md format
- **References**: local file references resolve; no broken relative paths
- **Safety**: explicit non-goals, risk boundaries, fallback behavior
- **Runtime clarity**: required env vars + external services declared
- **Examples**: at least one realistic invocation example

Minimum publish policy: all validation gates pass in CI.

## Publish Flow

1. Contributor opens PR with:
   - skill directory
   - submission template
   - validation checklist
2. CI runs skill lint/validation.
3. Maintainer review:
   - scope fit, safety posture, docs clarity
4. Merge to main.
5. Registry publish job packages metadata + immutable artifact reference.
6. Registry index updates with status tier (`community`/`verified`/`featured`).

## Status Tiers

### 1) Community
Default tier after accepted contribution.

Requirements:
- validation passes
- basic docs present
- no known critical safety gaps

### 2) Verified
Maintainer-reviewed for production readiness.

Requirements:
- all `community` requirements
- manual maintainer review completed
- deterministic behavior and clear failure handling
- dependency and permission surface clearly documented

### 3) Featured
High-confidence skill highlighted to users.

Requirements:
- all `verified` requirements
- strong operator UX (clear examples, low setup friction)
- evidence of real usage and maintainership responsiveness
- no unresolved high-severity issues

## Revocation / Downgrade Policy

- Any tier can be downgraded for safety, quality, or maintenance regressions.
- Critical issues may trigger immediate unpublish (with advisory note).
- Registry metadata should preserve history of status changes.

## Maintainer Operating Rules

- Prefer explicit safety over growth of catalog size.
- Do not feature skills with ambiguous external side effects.
- Keep review notes concise and public in PR comments.

## Initial v1.1 Rollout

- Land templates and docs first.
- Introduce `skills:validate` in CI as non-blocking for 1 cycle.
- Flip to blocking once baseline compliance is stable.
- Add registry status field + badges in docs/discovery surfaces.
