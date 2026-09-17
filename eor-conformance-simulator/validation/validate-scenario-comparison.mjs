import assert from 'node:assert/strict';
import { compareScenarios } from '../src/scenario-comparison.js';

const baseline={geologyId:'seed-137',breakthroughStep:4,history:[
  {injectedPvi:0,qo:10,wc:0,rf:.10},{injectedPvi:.5,qo:8,wc:.15,rf:.25},{injectedPvi:1,qo:6,wc:.40,rf:.40}
]};
const treated={geologyId:'seed-137',breakthroughStep:6,history:[
  {injectedPvi:0,qo:10,wc:0,rf:.10},{injectedPvi:.5,qo:9,wc:.08,rf:.27},{injectedPvi:1,qo:7,wc:.25,rf:.43}
]};
const c=compareScenarios({baseline,treated});
assert.equal(c.matureComparison,true);
assert.equal(c.breakthroughDelaySteps,2);
assert.ok(Math.abs(c.waterCutReductionPctPoints-15)<1e-12);
assert.ok(Math.abs(c.recoveryChangePctPoints-3)<1e-12);
assert.ok(c.incrementalOilIndex>0);
assert.match(c.interpretation,/not a field-calibrated prediction/i);

assert.throws(()=>compareScenarios({baseline,treated:{...treated,geologyId:'seed-999'}}),/same-geology/i);
const immature=compareScenarios({baseline:{...baseline,breakthroughStep:null,history:baseline.history.map(r=>({...r,wc:0}))},treated:{...treated,breakthroughStep:null,history:treated.history.map(r=>({...r,wc:0}))}});
assert.equal(immature.matureComparison,false);
assert.match(immature.interpretation,/do not claim conformance benefit/i);
console.log('Scenario comparison validation passed');
