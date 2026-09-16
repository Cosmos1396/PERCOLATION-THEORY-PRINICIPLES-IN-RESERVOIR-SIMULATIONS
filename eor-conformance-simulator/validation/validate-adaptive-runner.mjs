import assert from 'node:assert/strict';
import { runToFloodHorizon } from '../src/adaptive-runner.js';

// Pre-breakthrough case: reaching target PVI is sufficient, but must not claim treatment benefit.
{
  const r = runToFloodHorizon({
    targetInjectedPvi: 1.0,
    maxSteps: 20,
    advance: step => ({ injectedPvi: 0.1 * (step + 1), waterCut: 0.02 })
  });
  assert.equal(r.control.reason, 'target-pv-pre-breakthrough');
  assert.equal(r.breakthroughStep, null);
  assert.ok(r.injectedPvi >= 1.0);
}

// Breakthrough case: continue for the full post-breakthrough observation window.
{
  const r = runToFloodHorizon({
    targetInjectedPvi: 0.5,
    postBreakthroughSteps: 4,
    maxSteps: 30,
    advance: step => ({ injectedPvi: 0.1 * (step + 1), waterCut: step >= 3 ? 0.12 : 0.03 })
  });
  assert.equal(r.breakthroughStep, 3);
  assert.equal(r.control.reason, 'target-pv-and-post-breakthrough-window');
  assert.ok(r.history.at(-1).step - r.breakthroughStep >= 4);
  assert.equal(r.maturity, 'post-breakthrough');
}

// Safety guard: a stalled/slow flood must terminate deterministically.
{
  const r = runToFloodHorizon({
    targetInjectedPvi: 2.0,
    maxSteps: 6,
    advance: step => ({ injectedPvi: 0.01 * (step + 1), waterCut: 0 })
  });
  assert.equal(r.control.reason, 'safety-step-limit');
  assert.equal(r.history.length, 6);
}

// Reproducibility guard: decreasing cumulative PVI is invalid.
assert.throws(() => runToFloodHorizon({
  maxSteps: 4,
  advance: step => ({ injectedPvi: step === 0 ? 0.2 : 0.1, waterCut: 0 })
}), /non-decreasing/);

console.log('Adaptive flood-horizon runner validation passed.');
