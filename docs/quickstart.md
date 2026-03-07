# Quickstart

## Option A — One-command installer (recommended for fresh operators)

```bash
bash scripts/install.sh
```

This script:
1. Verifies Node.js >= 20 is present
2. Runs `npm install`
3. Runs `doctor` to validate the environment
4. Runs `init --profile research-agent` (skipped if already initialised)
5. Prints next steps

The script is idempotent — safe to run more than once.

---

## Option B — Manual setup

### 1) Install
```bash
npm install
```

### 2) Validate environment
```bash
wrenos doctor
```

### 3) Initialize profile
```bash
wrenos init --profile research-agent
```

### 4) Check status
```bash
wrenos status
```

---

## Generating WrenOS operator templates

After initialising, scaffold starter `AGENTS.md` and `HEARTBEAT.md` templates:

```bash
wrenos bootstrap-wrenos
```

This creates `.wrenos/wrenos-templates/` containing:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent identity, data sources, confidence tiers, risk limits |
| `HEARTBEAT.md` | Heartbeat loop cadence, lanes, adaptive tuner, regression guard |
| `README.md` | Instructions for copying and activating the templates |

Templates are **not** active until you copy them into `.wrenos/`:

```bash
cp .wrenos/wrenos-templates/AGENTS.md .wrenos/AGENTS.md
cp .wrenos/wrenos-templates/HEARTBEAT.md .wrenos/HEARTBEAT.md
```

All templates default to `liveExecution: false`. See `docs/safety.md` before enabling live execution.

---

## Profiles

| Profile | Live execution | Trade mode |
|---------|---------------|------------|
| `research-agent` | off | none |
| `solo-trader-paper` | off | paper |

Switch profiles at any time by re-running `init`:

```bash
wrenos init --profile solo-trader-paper
```


## Optional: initialize a neutral dual-agent pack

```bash
wrenos init-pack --pack dual-agent-pack
```

This creates `.wrenos/pack-dual-agent.json` with neutral names (`research-agent`, `trading-agent`) and a handoff contract.


## Roadmap note

`wrenos start` orchestration command is not shipped yet. Use your existing heartbeat/cron wiring for now.

## Migration note

If you're coming from `0xClaw`:
- use `wrenos` as the primary CLI name
- `0xclaw` remains as temporary compatibility alias
- `.wrenos/` is the new primary config directory (`.0xclaw/` fallback still supported)
- optional migration command: `wrenos migrate` (or `wrenos migrate --force`)
- after migration, validate with: `wrenos doctor && wrenos status`

See: `docs/migration-0xclaw-to-wrenos.md`

See also: `docs/speakeasy-integration.md` for private inference routing guidance.
