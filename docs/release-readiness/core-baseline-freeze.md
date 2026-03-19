# WRE-117 Core Repo Baseline Freeze (wrenOS)

Generated: 2026-03-19T00:35:56Z (UTC)
Repo: wrensignal/wrenOS
Branch: quill/wre-117-core-baseline-freeze
Baseline HEAD: 2125d5e17cbaa53588e09fc73b9c82cc6b478a2a

## Branch strategy
- Feature-branch delivery only
- No direct pushes to main

## Git status summary
```bash
## quill/wre-117-core-baseline-freeze
```

### Porcelain status
```bash

```

## Recent commit window (last 20)
```text
2125d5e Merge pull request #4 from wrensignal/quill/wre-93-v1-traceability-matrix
41792c6 docs: add v1 traceability matrix and link from PROJECT_SPEC
2f03f79 Merge pull request #3 from wrensignal/heron/dev
```

## Verification/Test evidence
### npm test
```text

> wrenos@0.1.0 test
> npm run test --workspaces --if-present


> @wrenos/cli@0.1.0 test
> node --test test/*.test.mjs

TAP version 13
# Subtest: init-pack creates pack config and .mcp.json
ok 1 - init-pack creates pack config and .mcp.json
  ---
  duration_ms: 72.91125
  type: 'test'
  ...
# Subtest: bootstrap-wrenos creates template set
ok 2 - bootstrap-wrenos creates template set
  ---
  duration_ms: 53.894625
  type: 'test'
  ...
# Subtest: test inference command returns structured diagnostics (failure path)
ok 3 - test inference command returns structured diagnostics (failure path)
  ---
  duration_ms: 147.4305
  type: 'test'
  ...
# Subtest: test execution command returns structured diagnostics envelope
ok 4 - test execution command returns structured diagnostics envelope
  ---
  duration_ms: 416.05175
  type: 'test'
  ...
# Subtest: railway deploy assumptions file remains present and parseable
ok 5 - railway deploy assumptions file remains present and parseable
  ---
  duration_ms: 0.942083
  type: 'test'
  ...
# Subtest: init creates config and mcp template
ok 6 - init creates config and mcp template
  ---
  duration_ms: 73.007083
  type: 'test'
  ...
# Subtest: doctor passes after init
ok 7 - doctor passes after init
  ---
  duration_ms: 108.760208
  type: 'test'
  ...
# Subtest: config set writes nested values
ok 8 - config set writes nested values
  ---
  duration_ms: 117.434917
  type: 'test'
  ...
# Subtest: wallet setup supports privy provider metadata
ok 9 - wallet setup supports privy provider metadata
  ---
  duration_ms: 59.988208
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 767.784542

> speakeasy-ai@0.1.0 test
> node --test test/*.test.mjs

TAP version 13
# node:internal/modules/package_json_reader:314
#   throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
#         ^
# Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'viem' imported from /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai/src/index.mjs
#     at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)
#     at packageResolve (node:internal/modules/esm/resolve:767:81)
#     at moduleResolve (node:internal/modules/esm/resolve:853:18)
#     at defaultResolve (node:internal/modules/esm/resolve:983:11)
#     at \#cachedDefaultResolve (node:internal/modules/esm/loader:731:20)
#     at ModuleLoader.resolve (node:internal/modules/esm/loader:708:38)
#     at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:310:38)
#     at ModuleJob._link (node:internal/modules/esm/module_job:182:49) {
#   code: 'ERR_MODULE_NOT_FOUND'
# }
# Node.js v22.22.0
# Subtest: test/client.test.mjs
not ok 1 - test/client.test.mjs
  ---
  duration_ms: 51.818125
  type: 'test'
  location: '/Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai/test/client.test.mjs:1:1'
  failureType: 'testCodeFailure'
  exitCode: 1
  signal: ~
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 56.049041
npm error Lifecycle script `test` failed with error:
npm error code 1
npm error path /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai
npm error workspace speakeasy-ai@0.1.0
npm error location /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai
npm error command failed
npm error command sh -c node --test test/*.test.mjs
```

### npm run verify
```text

> wrenos@0.1.0 verify
> npm run build && npm run lint && npm run typecheck && npm run test && npm run smoke:cli


> wrenos@0.1.0 build
> node scripts/build.mjs

{
  "ok": true,
  "artifactScanFiles": 32,
  "note": "Build step validates source tree integrity for this no-compile ESM workspace."
}

> wrenos@0.1.0 lint
> node scripts/lint.mjs

{
  "ok": true,
  "checked": [
    "packages",
    "docs",
    "examples",
    "scripts"
  ]
}

> wrenos@0.1.0 typecheck
> node scripts/typecheck.mjs

{
  "ok": true,
  "exportsChecks": [
    {
      "pkg": "@wrenos/adapters",
      "entry": "src/index.mjs"
    },
    {
      "pkg": "@wrenos/core",
      "entry": "src/index.mjs"
    },
    {
      "pkg": "@wrenos/loops",
      "entry": "src/index.mjs"
    },
    {
      "pkg": "@wrenos/mcp",
      "entry": "src/index.mjs"
    },
    {
      "pkg": "@wrenos/profiles",
      "entry": "src/index.mjs"
    },
    {
      "pkg": "speakeasy-ai",
      "entry": "src/index.mjs"
    }
  ]
}

> wrenos@0.1.0 test
> npm run test --workspaces --if-present


> @wrenos/cli@0.1.0 test
> node --test test/*.test.mjs

TAP version 13
# Subtest: init-pack creates pack config and .mcp.json
ok 1 - init-pack creates pack config and .mcp.json
  ---
  duration_ms: 59.179292
  type: 'test'
  ...
# Subtest: bootstrap-wrenos creates template set
ok 2 - bootstrap-wrenos creates template set
  ---
  duration_ms: 52.412333
  type: 'test'
  ...
# Subtest: test inference command returns structured diagnostics (failure path)
ok 3 - test inference command returns structured diagnostics (failure path)
  ---
  duration_ms: 123.17225
  type: 'test'
  ...
# Subtest: test execution command returns structured diagnostics envelope
ok 4 - test execution command returns structured diagnostics envelope
  ---
  duration_ms: 320.189917
  type: 'test'
  ...
# Subtest: railway deploy assumptions file remains present and parseable
ok 5 - railway deploy assumptions file remains present and parseable
  ---
  duration_ms: 0.252625
  type: 'test'
  ...
# Subtest: init creates config and mcp template
ok 6 - init creates config and mcp template
  ---
  duration_ms: 58.723625
  type: 'test'
  ...
# Subtest: doctor passes after init
ok 7 - doctor passes after init
  ---
  duration_ms: 100.694292
  type: 'test'
  ...
# Subtest: config set writes nested values
ok 8 - config set writes nested values
  ---
  duration_ms: 101.246333
  type: 'test'
  ...
# Subtest: wallet setup supports privy provider metadata
ok 9 - wallet setup supports privy provider metadata
  ---
  duration_ms: 51.624708
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 635.735875

> speakeasy-ai@0.1.0 test
> node --test test/*.test.mjs

TAP version 13
# node:internal/modules/package_json_reader:314
#   throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
#         ^
# Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'viem' imported from /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai/src/index.mjs
#     at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)
#     at packageResolve (node:internal/modules/esm/resolve:767:81)
#     at moduleResolve (node:internal/modules/esm/resolve:853:18)
#     at defaultResolve (node:internal/modules/esm/resolve:983:11)
#     at \#cachedDefaultResolve (node:internal/modules/esm/loader:731:20)
#     at ModuleLoader.resolve (node:internal/modules/esm/loader:708:38)
#     at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:310:38)
#     at ModuleJob._link (node:internal/modules/esm/module_job:182:49) {
#   code: 'ERR_MODULE_NOT_FOUND'
# }
# Node.js v22.22.0
# Subtest: test/client.test.mjs
not ok 1 - test/client.test.mjs
  ---
  duration_ms: 51.871167
  type: 'test'
  location: '/Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai/test/client.test.mjs:1:1'
  failureType: 'testCodeFailure'
  exitCode: 1
  signal: ~
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 55.976041
npm error Lifecycle script `test` failed with error:
npm error code 1
npm error path /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai
npm error workspace speakeasy-ai@0.1.0
npm error location /Users/clawd/.openclaw/workspace-quill/wrenOS/packages/speakeasy-ai
npm error command failed
npm error command sh -c node --test test/*.test.mjs
```

## Notes
- This artifact captures the current reproducible baseline for core-repo v1 execution.
- Any failures above should be triaged in follow-up issues before go/no-go.
