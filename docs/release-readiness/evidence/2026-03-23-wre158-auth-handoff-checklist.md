# WRE-158 authenticated handoff checklist (operator execution packet)

Purpose: one-shot execution packet for the authenticated tester who will run the final Railway proof flow.

## Inputs to provide before run
- Railway account email used for the fresh workspace
- Confirmation the session is signed in at railway.com
- Canonical deploy URL used:
  - `https://railway.com/deploy/wrenos?referralCode=wrenos&utm_source=github&utm_medium=readme`

## Required values to enter
- `PROFILE=research-agent`
- `OPENCLAW_API_KEY=<secret>`
- `TELEGRAM_BOT_TOKEN=<secret>`
- At least one:
  - `OPENAI_API_KEY=<secret>` or
  - `ANTHROPIC_API_KEY=<secret>` or
  - `GEMINI_API_KEY=<secret>`

## Proof artifacts required (must attach all)
1. Screenshot: var-entry form with required keys present (mask values)
2. Screenshot: successful draft deploy state (service healthy/running)
3. Screenshot: project overview showing created WrenOS service
4. Text log: exact UTC timestamps for steps completed

## Completion statement template
Use this exact statement in issue comment when done:

"Authenticated fresh-account clickthrough completed on canonical deploy slug. Required vars accepted with no hidden extras. Draft deploy reached healthy state. Attached form/deploy/project screenshots and UTC step log."

## Failure capture template
If blocked, include:
- failing step number
- exact UI error text
- screenshot proving error
- whether blocker is docs mismatch vs platform auth/permission
