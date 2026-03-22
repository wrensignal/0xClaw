# Future lane split architecture (hosted + operator)

WrenOS keeps one shared codebase with two deployment lanes:

- Hosted lane (Railway default): `docs/hosted-quickstart.md`
- Operator lane (advanced/custom): `docs/operator/README.md`

Shared invariants:
- same core packages and skills contracts
- lane-specific env contracts documented separately
- lane drift must be explicitly tested and documented in release-readiness artifacts

Env contracts:
- Hosted: `docs/env-contract-hosted.md`
- Operator: `docs/env-contract-operator.md`
