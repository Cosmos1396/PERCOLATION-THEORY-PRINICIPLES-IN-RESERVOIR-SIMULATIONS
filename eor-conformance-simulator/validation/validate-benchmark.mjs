import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const benchmark = JSON.parse(fs.readFileSync(path.join(here, 'benchmark.json'), 'utf8'));
const csvPath = path.resolve(here, benchmark.source_metrics);
const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, i === 0 ? values[i] : Number(values[i])]));
});

const untreated = rows.find(r => r.case === 'Polymer - untreated');
const treated = rows.find(r => r.case === 'Polymer + gel');
if (!untreated || !treated) throw new Error('Expected benchmark cases are missing from case_metrics.csv');

const checks = [
  ['same connected high-k fraction', !benchmark.acceptance.same_connected_high_k_fraction || untreated.connected_high_k_pct === treated.connected_high_k_pct],
  ['untreated case has zero treated cells', untreated.treated_cells === benchmark.acceptance.untreated_treated_cells],
  ['treated case contains treated cells', treated.treated_cells >= benchmark.acceptance.treated_treated_cells_min],
  ['gel does not accelerate breakthrough', !benchmark.acceptance.treated_breakthrough_not_earlier || treated.breakthrough_step >= untreated.breakthrough_step],
  ['gel does not raise final water cut', !benchmark.acceptance.treated_final_water_cut_not_higher || treated.final_water_cut_pct <= untreated.final_water_cut_pct],
  ['recovery-factor response remains within reduced-order tolerance', Math.abs(treated.recovery_factor_pct - untreated.recovery_factor_pct) <= benchmark.acceptance.recovery_factor_absolute_change_max_pct_points]
];

let failed = 0;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failed++;
}

console.log(`\nBenchmark: ${benchmark.name}`);
console.log(`Breakthrough: ${untreated.breakthrough_step} -> ${treated.breakthrough_step} steps`);
console.log(`Final water cut: ${untreated.final_water_cut_pct.toFixed(2)}% -> ${treated.final_water_cut_pct.toFixed(2)}%`);
console.log(`Recovery factor: ${untreated.recovery_factor_pct.toFixed(2)}% -> ${treated.recovery_factor_pct.toFixed(2)}%`);
console.log(`Connected high-k: ${untreated.connected_high_k_pct.toFixed(3)}% in both cases`);

if (failed) {
  console.error(`\n${failed} benchmark check(s) failed.`);
  process.exit(1);
}
console.log('\nAll engineering regression checks passed.');
