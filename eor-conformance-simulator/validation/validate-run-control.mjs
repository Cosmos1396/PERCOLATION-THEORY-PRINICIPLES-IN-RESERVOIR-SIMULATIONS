import assert from 'node:assert/strict';
import { evaluateRunControl, floodMaturity } from '../src/run-control.js';

let r=evaluateRunControl({injectedPvi:.4,breakthroughStep:null,step:90,targetInjectedPvi:1});
assert.equal(r.complete,false);
assert.equal(floodMaturity({injectedPvi:.4,breakthroughStep:null,step:90}),'early-flood');

r=evaluateRunControl({injectedPvi:1.01,breakthroughStep:null,step:240,targetInjectedPvi:1});
assert.equal(r.complete,true);
assert.equal(r.reason,'target-pv-pre-breakthrough');
assert.equal(floodMaturity({injectedPvi:1.01,breakthroughStep:null,step:240}),'pre-breakthrough-after-1.0-PVI');

r=evaluateRunControl({injectedPvi:1.1,breakthroughStep:180,step:195,targetInjectedPvi:1,postBreakthroughSteps:30});
assert.equal(r.complete,false);
r=evaluateRunControl({injectedPvi:1.1,breakthroughStep:180,step:210,targetInjectedPvi:1,postBreakthroughSteps:30});
assert.equal(r.complete,true);
assert.equal(r.reason,'target-pv-and-post-breakthrough-window');
assert.equal(floodMaturity({injectedPvi:1.1,breakthroughStep:180,step:210}),'post-breakthrough');

r=evaluateRunControl({injectedPvi:.2,breakthroughStep:null,step:1000,maxSteps:1000});
assert.equal(r.complete,true);
assert.equal(r.reason,'safety-step-limit');
console.log('Run-control validation passed.');
