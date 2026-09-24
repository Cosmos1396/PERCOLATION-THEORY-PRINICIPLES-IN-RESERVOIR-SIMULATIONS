import { evaluateRunControl, floodMaturity } from './run-control.js';

/**
 * Advance a reservoir case until a physically interpretable flood horizon is reached.
 * The caller owns the reservoir state and supplies one conservative FV advance.
 * This module owns only termination/maturity policy so numerical physics stays testable.
 *
 * Post-breakthrough maturity is measured in injected pore volume rather than timestep
 * count so the observation window is invariant to adaptive numerical timestep size.
 */
export function runToFloodHorizon({
  advance,
  targetInjectedPvi = 1.0,
  postBreakthroughPvi = 0.20,
  maxSteps = 1000,
  breakthroughWaterCut = 0.10,
  onSnapshot = null
}) {
  if (typeof advance !== 'function') throw new TypeError('advance must be a function');
  if (!(targetInjectedPvi > 0)) throw new RangeError('targetInjectedPvi must be > 0');
  if (!(postBreakthroughPvi >= 0)) throw new RangeError('postBreakthroughPvi must be >= 0');
  if (!(maxSteps > 0)) throw new RangeError('maxSteps must be > 0');

  let injectedPvi = 0;
  let breakthroughStep = null;
  let breakthroughInjectedPvi = null;
  const history = [];

  for (let step = 0; step < maxSteps; step++) {
    const result = advance(step);
    if (!result || !Number.isFinite(result.injectedPvi)) {
      throw new Error('advance() must return finite cumulative injectedPvi');
    }
    if (result.injectedPvi + 1e-12 < injectedPvi) {
      throw new Error('cumulative injectedPvi must be non-decreasing');
    }
    injectedPvi = result.injectedPvi;
    const waterCut = Number.isFinite(result.waterCut) ? result.waterCut : 0;
    if (breakthroughStep === null && waterCut >= breakthroughWaterCut) {
      breakthroughStep = step;
      breakthroughInjectedPvi = injectedPvi;
    }

    const maturity = floodMaturity({ injectedPvi, breakthroughStep, breakthroughInjectedPvi });
    const record = { step, ...result, injectedPvi, breakthroughStep, breakthroughInjectedPvi, maturity };
    history.push(record);
    if (onSnapshot) onSnapshot(record);

    const control = evaluateRunControl({
      injectedPvi,
      breakthroughStep,
      breakthroughInjectedPvi,
      step,
      targetInjectedPvi,
      postBreakthroughPvi,
      maxSteps: maxSteps - 1
    });
    if (control.complete) {
      return { history, injectedPvi, breakthroughStep, breakthroughInjectedPvi, maturity, control };
    }
  }

  throw new Error('adaptive runner exited without a run-control decision');
}
