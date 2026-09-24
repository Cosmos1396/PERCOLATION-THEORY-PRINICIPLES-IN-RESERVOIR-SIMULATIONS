import assert from 'node:assert/strict';
import { evaluateRunControl, floodMaturity } from '../src/run-control.js';

let r=evaluateRunControl({injectedPvi:.4,breakthroughStep:null,step:90,targetInjectedPvi:1});
assert.equal(r.complete,false);
assert.equal(floodMaturity({injectedPvi:.4,breakthroughStep:null}),'early-flood');

r=evaluateRunControl({injectedPvi:1.01,breakthroughStep:null,step:240,targetInjectedPvi:1});
assert.equal(r.complete,true);
assert.equal(r.reason,'target-pv-pre-breakthrough');
assert.equal(floodMaturity({injectedPvi:1.01,breakthroughStep:null}),'pre-breakthrough-after-1.0-PVI');

// A breakthrough case must accrue a physical injected-PVI observation window,
// independent of how many numerical timesteps happen to be taken.
r=evaluateRunControl({injectedPvi:.69,breakthroughStep:18,breakthroughInjectedPvi:.50,step:195,targetInjectedPvi:.6,postBreakthroughPvi:.20});
assert.equal(r.complete,false);
assert.ok(r.postBreakthroughInjectedPvi < .20);
r=evaluateRunControl({injectedPvi:.70,breakthroughStep:18,breakthroughInjectedPvi:.50,step:196,targetInjectedPvi:.6,postBreakthroughPvi:.20});
assert.equal(r.complete,true);
assert.equal(r.reason,'target-pv-and-post-breakthrough-pvi-window');
assert.ok(r.postBreakthroughInjectedPvi >= .20 - 1e-12);
assert.equal(floodMaturity({injectedPvi:.70,breakthroughStep:18,breakthroughInjectedPvi:.50}),'post-breakthrough');

// Step count alone must not satisfy post-breakthrough maturity.
r=evaluateRunControl({injectedPvi:.55,breakthroughStep:2,breakthroughInjectedPvi:.50,step:900,targetInjectedPvi:.5,postBreakthroughPvi:.20,maxSteps:1000});
assert.equal(r.complete,false);
assert.equal(r.postBreakthroughReached,false);

r=evaluateRunControl({injectedPvi:.2,breakthroughStep:null,step:1000,maxSteps:1000});
assert.equal(r.complete,true);
assert.equal(r.reason,'safety-step-limit');
console.log('Run-control validation passed.');
