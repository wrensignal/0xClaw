#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const checklist = readFileSync('docs/release-readiness/v1-checklist.md', 'utf8');
const trackerPath = process.argv[2] || 'examples/release-readiness/v1-evidence-tracker.sample.json';
const tracker = JSON.parse(readFileSync(trackerPath, 'utf8'));

const requiredDocMarkers = [
  '# WrenOS v1 Launch Checklist (Go / No-Go)',
  '## Launch decision rule',
  '## Gate matrix',
  '## Must-pass verification commands',
  '## Rollback criteria and procedure',
  '## Evidence links section'
];

const requiredEvidenceKeys = [
  'wrenosReleasePr',
  'siteReleasePr',
  'contractValidationEvidence',
  'siteRegressionEvidence',
  'rollbackDryRunEvidence',
  'decisionTimestamp'
];

const checks = [];
for (const marker of requiredDocMarkers) {
  checks.push({ check: `doc contains marker: ${marker}`, pass: checklist.includes(marker) });
}
for (const key of requiredEvidenceKeys) {
  checks.push({ check: `tracker key present: ${key}`, pass: Object.prototype.hasOwnProperty.call(tracker, key) });
}

const failed = checks.filter((c) => !c.pass);
const out = {
  ok: failed.length === 0,
  checklistPath: 'docs/release-readiness/v1-checklist.md',
  trackerPath,
  checks
};
console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
