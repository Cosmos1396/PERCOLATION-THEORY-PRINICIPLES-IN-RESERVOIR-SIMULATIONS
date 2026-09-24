export function evaluateRunControl({
  injectedPvi,
  breakthroughStep,
  breakthroughInjectedPvi = null,
  step,
  targetInjectedPvi = 1.0,
  postBreakthroughPvi = 0.20,
  maxSteps = 1000
}) {
  const pvReached = Number.isFinite(injectedPvi) && injectedPvi >= targetInjectedPvi;
  const breakthroughReached = Number.isInteger(breakthroughStep) && breakthroughStep >= 0;
  const breakthroughPviKnown = Number.isFinite(breakthroughInjectedPvi) && breakthroughInjectedPvi >= 0;
  const postBreakthroughInjectedPvi = breakthroughReached && breakthroughPviKnown && Number.isFinite(injectedPvi)
    ? Math.max(0, injectedPvi - breakthroughInjectedPvi)
    : 0;
  const postBreakthroughReached = breakthroughReached && breakthroughPviKnown && postBreakthroughInjectedPvi >= postBreakthroughPvi;
  const safetyStop = step >= maxSteps;
  const complete = safetyStop || (pvReached && (!breakthroughReached || postBreakthroughReached));

  let reason = 'continue';
  if (safetyStop) reason = 'safety-step-limit';
  else if (complete && breakthroughReached) reason = 'target-pv-and-post-breakthrough-pvi-window';
  else if (complete) reason = 'target-pv-pre-breakthrough';

  return {
    complete,
    reason,
    pvReached,
    breakthroughReached,
    breakthroughPviKnown,
    postBreakthroughInjectedPvi,
    postBreakthroughReached,
    safetyStop
  };
}

export function floodMaturity({ injectedPvi, breakthroughStep, breakthroughInjectedPvi = null }) {
  if (Number.isInteger(breakthroughStep) && breakthroughStep >= 0) {
    if (Number.isFinite(breakthroughInjectedPvi) && injectedPvi > breakthroughInjectedPvi + 1e-12) return 'post-breakthrough';
    return 'at-breakthrough';
  }
  if (injectedPvi >= 1.0) return 'pre-breakthrough-after-1.0-PVI';
  if (injectedPvi >= 0.5) return 'pre-breakthrough-after-0.5-PVI';
  return 'early-flood';
}
