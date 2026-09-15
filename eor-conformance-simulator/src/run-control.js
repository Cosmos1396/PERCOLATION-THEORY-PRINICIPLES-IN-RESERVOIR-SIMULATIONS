export function evaluateRunControl({ injectedPvi, breakthroughStep, step, targetInjectedPvi = 1.0, postBreakthroughSteps = 30, maxSteps = 1000 }) {
  const pvReached = Number.isFinite(injectedPvi) && injectedPvi >= targetInjectedPvi;
  const breakthroughReached = Number.isInteger(breakthroughStep) && breakthroughStep >= 0;
  const postBreakthroughReached = breakthroughReached && step - breakthroughStep >= postBreakthroughSteps;
  const safetyStop = step >= maxSteps;
  const complete = safetyStop || (pvReached && (!breakthroughReached || postBreakthroughReached));
  let reason = 'continue';
  if (safetyStop) reason = 'safety-step-limit';
  else if (complete && breakthroughReached) reason = 'target-pv-and-post-breakthrough-window';
  else if (complete) reason = 'target-pv-pre-breakthrough';
  return { complete, reason, pvReached, breakthroughReached, postBreakthroughReached, safetyStop };
}

export function floodMaturity({ injectedPvi, breakthroughStep, step }) {
  if (Number.isInteger(breakthroughStep) && breakthroughStep >= 0) {
    return step > breakthroughStep ? 'post-breakthrough' : 'at-breakthrough';
  }
  if (injectedPvi >= 1.0) return 'pre-breakthrough-after-1.0-PVI';
  if (injectedPvi >= 0.5) return 'pre-breakthrough-after-0.5-PVI';
  return 'early-flood';
}
