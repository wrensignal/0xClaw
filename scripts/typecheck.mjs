#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkgRoot = path.join(root, 'packages');
const exportsChecks = [];
const missing = [];
for (const pkg of readdirSync(pkgRoot)) {
  const pkgDir = path.join(pkgRoot, pkg);
  if (!statSync(pkgDir).isDirectory()) continue;
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  try {
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const entry = pkgJson.main || (pkgJson.exports && pkgJson.exports['.']);
    if (entry) {
      const abs = path.join(pkgDir, entry);
      try { statSync(abs); exportsChecks.push({ pkg: pkgJson.name, entry }); } catch { missing.push({ pkg: pkgJson.name, entry }); }
    }
  } catch {}
}
if (missing.length) {
  console.error(JSON.stringify({ ok: false, missing }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, exportsChecks }, null, 2));
