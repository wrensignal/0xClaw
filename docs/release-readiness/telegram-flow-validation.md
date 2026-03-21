# Telegram Flow Validation (WRE-134)

## Implemented v1 flow

### Alert delivery wiring
- Discovery hits -> `notify({ type: "discovery_hit", ... })`
- Trade signals -> `notify({ type: "trade_signal", ... })`
- Heartbeat alerts -> `notify({ type: "heartbeat_alert", ... })`
- Performance report delivery -> `notify({ type: "performance_report", ... })`

### Operator command baseline
- `/status`
- `/watchlist`
- `/health`
- `/heartbeat`
- `/performance`
- `/trade <symbol>`
- `/paper on|off`
- `/alerts on|off`

### Skill hooks
- heartbeat-monitor integration via `getHeartbeat` and `heartbeat_alert` notifications
- performance-report integration via `getPerformance` and `performance_report` notifications

## Paper-mode validation
- Paper mode defaults ON
- `/paper off` toggles state via hook callback
- `/alerts off` suppresses outbound notify delivery

## Verification commands
```bash
npm run -w @wrenos/adapters test
npm test
```
