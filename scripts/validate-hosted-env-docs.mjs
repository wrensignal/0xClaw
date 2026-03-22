#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const hostedDocs = [
  path.join(repoRoot, 'docs/quickstart.md'),
  path.join(repoRoot, 'docs/railway-first-run-playbook.md')
];

const operatorOnlyVars = [
  'OPENCLAW_OPERATOR_MODE',
  'OPENCLAW_RUNTIME_TOPOLOGY',
  'OPENCLAW_ADAPTER_OVERRIDES',
  'OPENCLAW_MCP_SERVER_MAP'
];

const violations = [];
for (const file of hostedDocs) {
  const content = fs.readFileSync(file, 'utf8');
  for (const key of operatorOnlyVars) {
    if (content.includes(key)) {
      violations.push({ file: path.relative(repoRoot, file), key });
    }
  }
}

if (violations.length) {
  console.error('Hosted docs env contract violated (operator-only vars found):');
  for (const v of violations) {
    console.error(`- ${v.file}: ${v.key}`);
  }
  process.exit(1);
}

console.log('Hosted docs env contract check passed.');
