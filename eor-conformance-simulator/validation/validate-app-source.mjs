import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, '../src/app.js');
const source = fs.readFileSync(appPath, 'utf8');

execFileSync(process.execPath, ['--check', appPath], { stdio: 'inherit' });

const checks = [
  ['history stores the computed sweep metric', source.includes('history.push({t,qo,qw,wc,rf,sweep})')],
  ['stale undefined swept identifier is absent', !source.includes('history.push({t,qo,qw,wc,rf,swept})')]
];

let failed = 0;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failed++;
}

if (failed) {
  console.error(`\n${failed} app-source validation check(s) failed.`);
  process.exit(1);
}

console.log('\nApp source validation passed.');
