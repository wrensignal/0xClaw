#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const strict = process.argv.includes('--strict');
const forcedSha = (process.argv.find((a) => a.startsWith('--current-sha=')) || '').split('=')[1] || null;

const prov = JSON.parse(readFileSync('docs/provenance.json', 'utf8'));
const head = forcedSha || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

const requiredDocs = prov.trackedDocs || [];
const missingDocs = requiredDocs.filter((p) => !existsSync(p));

const quickstart = existsSync('docs/quickstart.md') ? readFileSync('docs/quickstart.md', 'utf8') : '';
const cliCommands = ['wrenos init', 'wrenos doctor', 'wrenos status', 'wrenos config', 'wrenos start'];
const missingInDocs = cliCommands.filter((cmd) => !quickstart.includes(cmd));

const drift = head !== prov.syncedCommit || missingDocs.length > 0 || missingInDocs.length > 0;
const report = {
  generatedAt: new Date().toISOString(),
  mode: strict ? 'strict' : 'warn',
  syncedCommit: prov.syncedCommit,
  currentCommit: head,
  commitDrift: head !== prov.syncedCommit,
  missingTrackedDocs: missingDocs,
  quickstartMissingCommands: missingInDocs,
  drift
};
mkdirSync('docs/reports', { recursive: true });
writeFileSync('docs/reports/docs-drift-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (drift && strict) process.exit(1);
