import assert from 'node:assert/strict';
import { producerStepVolumes, initialOilInPlace, accumulateProduction } from '../src/production-accounting.js';

const sw = Float64Array.from([0.2, 0.5]);
const outflows = [[0, 2], [1, 1]];
const fw = s => s;
const step = producerStepVolumes({ producerOutflows: outflows, sw, dt: 0.5, fractionalFlow: fw });
assert.ok(Math.abs(step.liquid - 1.5) < 1e-12);
assert.ok(Math.abs(step.water - 0.45) < 1e-12);
assert.ok(Math.abs(step.oil - 1.05) < 1e-12);
assert.ok(Math.abs(step.liquid - step.water - step.oil) < 1e-12, 'phase volumes must close to liquid production');
assert.ok(Math.abs(step.waterCut - 0.3) < 1e-12);

const pv = Float64Array.from([1, 1, 2]);
const ooip = initialOilInPlace({ pv, swi: 0.25 });
assert.equal(ooip, 3);
const a = accumulateProduction(null, { liquid: 0.3, water: 0.1, oil: 0.2, waterCut: 1/3 }, ooip);
const b = accumulateProduction(a, { liquid: 0.6, water: 0.2, oil: 0.4, waterCut: 1/3 }, ooip);
assert.ok(Math.abs(b.cumulativeOil - 0.6) < 1e-12);
assert.ok(Math.abs(b.cumulativeWater - 0.3) < 1e-12);
assert.ok(Math.abs(b.recoveryFactor - 0.2) < 1e-12, 'RF must be cumulative produced oil / initial oil in place');

assert.throws(() => initialOilInPlace({ pv, swi: 1 }), /swi/);
assert.throws(() => producerStepVolumes({ producerOutflows: outflows, sw, dt: -1, fractionalFlow: fw }), /dt/);
console.log('Production accounting validation passed');
