import assert from 'node:assert/strict';
import { coupledProductionStep } from '../src/coupled-step.js';
import { initialOilInPlace } from '../src/production-accounting.js';

const sw = new Float64Array([0.25, 0.35, 0.55]);
const pv = new Float64Array([1, 1, 1]);
const swi = 0.2;
const maxSw = 0.8;
const fractionalFlow = s => Math.max(0, Math.min(1, (s - swi) / (maxSw - swi)));
const producerOutflows = [[2, 0.4]];
const ooip = initialOilInPlace({ pv, swi });

const first = coupledProductionStep({
  sw,
  pv,
  fluxes: [[0, 1, 0.5], [1, 2, 0.35]],
  producerOutflows,
  fractionalFlow,
  swi,
  maxSw,
  inletIndices: [0],
  courant: 0.3,
  previousProduction: null,
  ooip
});

assert.ok(first.transport.dt > 0, 'transport must advance positive time');
assert.ok(Math.abs(first.waterMismatch) < 1e-12, 'producer water must match FV removal');
assert.ok(Math.abs(first.phaseVolumes.water - first.transport.producedWater) < 1e-12);
assert.ok(Math.abs(first.phaseVolumes.liquid - first.phaseVolumes.water - first.phaseVolumes.oil) < 1e-12);
assert.ok(first.production.recoveryFactor > 0);
assert.ok(first.production.recoveryFactor < 1);

// A second step must accumulate production monotonically using the new state.
const second = coupledProductionStep({
  sw: first.transport.sw,
  pv,
  fluxes: [[0, 1, 0.5], [1, 2, 0.35]],
  producerOutflows,
  fractionalFlow,
  swi,
  maxSw,
  inletIndices: [0],
  courant: 0.3,
  previousProduction: first.production,
  ooip
});
assert.ok(second.production.cumulativeOil >= first.production.cumulativeOil);
assert.ok(second.production.cumulativeWater >= first.production.cumulativeWater);
assert.ok(Math.abs(second.waterMismatch) < 1e-12);

console.log(JSON.stringify({
  status: 'PASS',
  firstDt: first.transport.dt,
  firstWaterMismatch: first.waterMismatch,
  firstRecoveryFactor: first.production.recoveryFactor,
  secondRecoveryFactor: second.production.recoveryFactor
}, null, 2));
