import { evaluateRunControl, floodMaturity } from './run-control.js';

/**
 * Advance a reservoir case until a physically interpretable flood horizon is reached.
 * The caller owns the reservoir state and supplies one conservative FV advance.
 * This module owns only termination/maturity policy so numerical physics stays testable.
 */
export function runToFloodHorizon({
  advance,
  targetInjectedPvi = 1.0,
  postBreakthroughSteps = 30,
  maxSteps = 1000,
  breakthroughWaterCut = 0.10,
  onSnapshot = null
}) {
  if (typeof advance !== 'function') throw new TypeError('advance must be a function');
  if (!(targetInjectedPvi > 0)) throw new RangeError('targetInjectedPvi must be > 0');
  if (!(postBreakthroughSteps >= 0)) throw new RangeError('postBreakthroughSteps must be >= 0');
  if (!(maxSteps > 0)) throw new RangeError('maxSteps must be > 0');

  let injectedPvi = 0;
  let breakthroughStep = null;
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
    if (breakthroughStep === null && waterCut >= breakthroughWaterCut) breakthroughStep = step;

    const maturity = floodMaturity({ injectedPvi, breakthroughStep, step });
    const record = { step, ...result, injectedPvi, breakthroughStep, maturity };
    history.push(record);
    if (onSnapshot) onSnapshot(record);

    const control = evaluateRunControl({
      injectedPvi,
      breakthroughStep,
      step,
      targetInjectedPvi,
      postBreakthroughSteps,
      maxSteps: maxSteps - 1
    });
    if (control.complete) {
      return { history, injectedPvi, breakthroughStep, maturity, control };
    }
  }

  throw new Error('adaptive runner exited without a run-control decision');
}
