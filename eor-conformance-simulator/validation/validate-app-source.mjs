import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, '../src/app.js');
const source = fs.readFileSync(appPath, 'utf8');

execFileSync(process.execPath, ['--check', appPath], { stdio: 'inherit' });

const checks = [
  ['history stores the computed sweep metric', source.includes('history.push({t,qo,qw,wc,rf,sweep,')],
  ['stale undefined swept identifier is absent', !source.includes('history.push({t,qo,qw,wc,rf,swept')],
  ['porosity is an explicit model parameter', source.includes('porosity:.22') && source.includes("porosity:+$('porosity').value")],
  ['normalized cell pore volume is constructed', source.includes('pv=new Float64Array(n).fill(p.porosity)')],
  ['water storage is pore-volume weighted', source.includes('function waterStorage(sw,pv)')],
  ['CA conservation defect is accumulated', source.includes('cumulativeDefect+=stepDefect')],
  ['conservation defect is stored as fraction of total PV', source.includes('caResidualPvi=cumulativeDefect/Math.max(totalPV,1e-12)')],
  ['UI labels conservation metric as a CA source defect', source.includes("$('mbKpi').textContent") && source.includes('not a field material balance')]
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
