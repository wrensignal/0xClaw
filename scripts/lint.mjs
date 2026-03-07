#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [path.join(root, 'packages'), path.join(root, 'docs'), path.join(root, 'examples'), path.join(root, 'scripts')];
const issues = [];
for (const base of targets) {
  try {
    const stack = [base];
    while (stack.length) {
      const cur = stack.pop();
      for (const name of readdirSync(cur)) {
        const full = path.join(cur, name);
        const st = statSync(full);
        if (st.isDirectory()) stack.push(full);
        else if (/\.(mjs|md|json)$/.test(name)) {
          const txt = readFileSync(full, 'utf8');
          if (txt.includes('\t')) issues.push({ file: path.relative(root, full), issue: 'tab-character' });
        }
      }
    }
  } catch {}
}
if (issues.length) {
  console.error(JSON.stringify({ ok: false, issues }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checked: targets.map((t) => path.relative(root, t)) }, null, 2));
