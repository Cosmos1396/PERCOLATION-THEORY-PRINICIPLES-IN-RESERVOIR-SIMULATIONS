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

// Breakthrough case: continue for a physical injected-PVI observation window.
{
  const r = runToFloodHorizon({
    targetInjectedPvi: 0.5,
    postBreakthroughPvi: 0.4,
    maxSteps: 30,
    advance: step => ({ injectedPvi: 0.1 * (step + 1), waterCut: step >= 3 ? 0.12 : 0.03 })
  });
  assert.equal(r.breakthroughStep, 3);
  assert.ok(Math.abs(r.breakthroughInjectedPvi - 0.4) < 1e-12);
  assert.equal(r.control.reason, 'target-pv-and-post-breakthrough-pvi-window');
  assert.ok(r.injectedPvi - r.breakthroughInjectedPvi >= 0.4 - 1e-12);
  assert.equal(r.maturity, 'post-breakthrough');
}

// Numerical timestep density must not change the physical stopping horizon.
{
  const coarse = runToFloodHorizon({
    targetInjectedPvi: 0.4,
    postBreakthroughPvi: 0.2,
    maxSteps: 30,
    advance: step => ({ injectedPvi: 0.1 * (step + 1), waterCut: step >= 2 ? 0.15 : 0.02 })
  });
  const fine = runToFloodHorizon({
    targetInjectedPvi: 0.4,
    postBreakthroughPvi: 0.2,
    maxSteps: 60,
    advance: step => ({ injectedPvi: 0.05 * (step + 1), waterCut: step >= 5 ? 0.15 : 0.02 })
  });
  assert.ok(coarse.control.postBreakthroughInjectedPvi >= 0.2 - 1e-12);
  assert.ok(fine.control.postBreakthroughInjectedPvi >= 0.2 - 1e-12);
  assert.ok(Math.abs(coarse.injectedPvi - fine.injectedPvi) <= 0.05 + 1e-12);
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
