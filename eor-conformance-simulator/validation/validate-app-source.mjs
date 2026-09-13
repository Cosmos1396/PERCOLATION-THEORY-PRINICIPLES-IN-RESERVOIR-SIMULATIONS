import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(here, '../src/app-fv-v2.js');
const indexPath = path.resolve(here, '../index.html');
const source = fs.readFileSync(appPath, 'utf8');
const html = fs.readFileSync(indexPath, 'utf8');

execFileSync(process.execPath, ['--check', appPath], { stdio: 'inherit' });

const checks = [
  ['active page loads the validated FV application', html.includes('./src/app-fv-v2.js')],
  ['porosity is an explicit model parameter', source.includes('porosity:.22') && source.includes("porosity:+$('porosity').value")],
  ['normalized pore volume is constructed', source.includes('pv=new Float64Array(n).fill(p.porosity)')],
  ['finite-volume transport kernel is used', source.includes('conservativeWaterStep')],
  ['water-balance residual is stored as fraction of total PV', source.includes('mbResidualPvi=cumulativeResidual/Math.max(totalPV,1e-12)')],
  ['calculated timestep states are snapshotted', source.includes('frames.push(snapshot(sw,pressure,treated))')],
  ['time-step playback uses stored states rather than interpolation', source.includes('function currentFrame()') && source.includes('latest.frames[i]')],
  ['K-layer slicing is implemented', source.includes('function selectedLayer()') && source.includes("$('layerMode').value==='slice'")],
  ['production chart follows the selected timestep', source.includes('shapes:cursor>0?')],
  ['viewer controls are present in HTML', html.includes('id="timeStep"') && html.includes('id="layerSlice"') && html.includes('id="playBtn"')],
  ['research-model interpretation boundary remains visible', html.includes('should not be treated as field forecasts')]
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

console.log('\nActive FV application source validation passed.');
