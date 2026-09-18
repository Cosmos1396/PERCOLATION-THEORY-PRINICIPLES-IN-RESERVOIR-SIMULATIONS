import assert from 'node:assert/strict';
import { compareScenarios } from '../src/scenario-comparison.js';

const baseline={geologyId:'seed-137',breakthroughStep:1,history:[
  {injectedPvi:0,qo:10,wc:0,rf:.10},{injectedPvi:.5,qo:8,wc:.15,rf:.25},{injectedPvi:1,qo:6,wc:.40,rf:.40}
]};
const treated={geologyId:'seed-137',breakthroughStep:2,history:[
  {injectedPvi:0,qo:10,wc:0,rf:.10},{injectedPvi:.5,qo:9,wc:.08,rf:.27},{injectedPvi:1,qo:7,wc:.25,rf:.43}
]};
const c=compareScenarios({baseline,treated});
assert.equal(c.matureComparison,true);
assert.equal(c.comparisonInjectedPvi,1);
assert.equal(c.baselineBreakthroughPvi,.5);
assert.equal(c.treatedBreakthroughPvi,1);
assert.equal(c.breakthroughDelayPvi,.5);
assert.ok(Math.abs(c.waterCutReductionPctPoints-15)<1e-12);
assert.ok(Math.abs(c.recoveryChangePctPoints-3)<1e-12);
assert.ok(c.incrementalOilIndex>0);
assert.match(c.interpretation,/matched 1\.000 PVI/i);
assert.match(c.interpretation,/not a field-calibrated prediction/i);

// A longer treated run must be clipped to the baseline PVI horizon rather than receiving
// artificial incremental credit from extra simulation time.
const longerTreated={...treated,history:[...treated.history,{injectedPvi:1.5,qo:50,wc:.1,rf:.8}]};
const matched=compareScenarios({baseline,treated:longerTreated});
assert.equal(matched.comparisonInjectedPvi,1);
assert.ok(Math.abs(matched.finalRecoveryTreated-.43)<1e-12);
assert.ok(Math.abs(matched.incrementalOilIndex-c.incrementalOilIndex)<1e-12);

assert.throws(()=>compareScenarios({baseline,treated:{...treated,geologyId:'seed-999'}}),/same-geology/i);
assert.throws(()=>compareScenarios({baseline,treated:{...treated,history:[treated.history[1],treated.history[0]]}}),/non-decreasing/i);

const immatureBaseline={...baseline,breakthroughStep:null,history:baseline.history.map(r=>({...r,wc:0}))};
const immatureTreated={...treated,breakthroughStep:null,history:treated.history.map(r=>({...r,wc:0}))};
const immature=compareScenarios({baseline:immatureBaseline,treated:immatureTreated});
assert.equal(immature.matureComparison,false);
assert.match(immature.interpretation,/do not claim conformance benefit/i);
console.log('Matched-PVI scenario comparison validation passed');
