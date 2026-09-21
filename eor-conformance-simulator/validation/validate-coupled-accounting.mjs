import assert from 'node:assert/strict';
import { conservativeWaterStep } from '../src/transport.js';
import { producerStepVolumes, initialOilInPlace, accumulateProduction } from '../src/production-accounting.js';

// Small deterministic displacement used to verify that the transport kernel and
// producer ledger use the same pre-step fractional-flow state and timestep.
const pv = Float64Array.from([1, 1, 1]);
const swi = 0.20;
const sw = Float64Array.from([0.80, 0.45, 0.30]);
const fluxes = [[0, 1, 1.0], [1, 2, 0.8]];
const producerOutflows = [[2, 0.5]];
const fractionalFlow = s => Math.max(0, Math.min(1, s));

const transport = conservativeWaterStep({
  sw,
  pv,
  fluxes,
  producerOutflows,
  fractionalFlow,
  swi,
  maxSw: 0.80,
  inletIndices: [0],
  courant: 0.25
});

const produced = producerStepVolumes({
  producerOutflows,
  sw, // deliberately the pre-step state used by the transport kernel
  dt: transport.dt,
  fractionalFlow
});

assert.ok(Math.abs(produced.water - transport.producedWater) < 1e-12,
  'producer water ledger must equal FV boundary water removal for the same step');
assert.ok(Math.abs(produced.liquid - produced.water - produced.oil) < 1e-12,
  'oil + water production must close to produced liquid');
assert.ok(produced.oil >= 0 && produced.water >= 0, 'phase production must remain non-negative');

const ooip = initialOilInPlace({ pv, swi });
const ledger = accumulateProduction(null, produced, ooip);
assert.ok(Math.abs(ledger.recoveryFactor - produced.oil / ooip) < 1e-12,
  'recovery factor must be based on cumulative produced oil / OOIP');
assert.ok(ledger.recoveryFactor >= 0 && ledger.recoveryFactor <= 1,
  'single-step normalized recovery must remain physically bounded');

// Guard against a subtle integration error: using post-step saturation for
// production accounting changes phase split relative to the FV boundary term.
const postStep = producerStepVolumes({
  producerOutflows,
  sw: transport.sw,
  dt: transport.dt,
  fractionalFlow
});
assert.ok(Math.abs(postStep.water - transport.producedWater) > 1e-10,
  'test case must detect post-step phase-split misuse');

console.log('Coupled FV/production accounting validation passed');
