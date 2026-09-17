const finite = v => Number.isFinite(v);

function last(history) {
  if (!Array.isArray(history) || history.length === 0) throw new Error('scenario history must be non-empty');
  return history[history.length - 1];
}

function trapz(history, key) {
  if (history.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < history.length; i++) {
    const a = history[i - 1], b = history[i];
    const xa = finite(a.injectedPvi) ? a.injectedPvi : i - 1;
    const xb = finite(b.injectedPvi) ? b.injectedPvi : i;
    const ya = finite(a[key]) ? a[key] : 0;
    const yb = finite(b[key]) ? b[key] : 0;
    total += 0.5 * (ya + yb) * Math.max(0, xb - xa);
  }
  return total;
}

/**
 * Compare untreated and conformance cases only when they share the same geology id.
 * Metrics are reduced-order, dimensionless decision-support outputs; they are not field forecasts.
 */
export function compareScenarios({ baseline, treated, waterCutThreshold = 0.10 }) {
  if (!baseline || !treated) throw new Error('baseline and treated scenarios are required');
  if (!baseline.geologyId || baseline.geologyId !== treated.geologyId) {
    throw new Error('same-geology comparison required');
  }
  const bh = baseline.history, th = treated.history;
  const bLast = last(bh), tLast = last(th);
  const bBt = baseline.breakthroughStep ?? bh.findIndex(r => (r.wc ?? r.waterCut ?? 0) >= waterCutThreshold);
  const tBt = treated.breakthroughStep ?? th.findIndex(r => (r.wc ?? r.waterCut ?? 0) >= waterCutThreshold);
  const baselineBt = bBt >= 0 ? bBt : null;
  const treatedBt = tBt >= 0 ? tBt : null;
  const breakthroughDelaySteps = baselineBt !== null && treatedBt !== null ? treatedBt - baselineBt : null;
  const finalWaterCutBaseline = bLast.wc ?? bLast.waterCut ?? 0;
  const finalWaterCutTreated = tLast.wc ?? tLast.waterCut ?? 0;
  const waterCutReductionPctPoints = 100 * (finalWaterCutBaseline - finalWaterCutTreated);
  const finalRecoveryBaseline = bLast.rf ?? bLast.recoveryFactor ?? 0;
  const finalRecoveryTreated = tLast.rf ?? tLast.recoveryFactor ?? 0;
  const recoveryChangePctPoints = 100 * (finalRecoveryTreated - finalRecoveryBaseline);
  const oilIndexBaseline = trapz(bh, 'qo');
  const oilIndexTreated = trapz(th, 'qo');
  const incrementalOilIndex = oilIndexTreated - oilIndexBaseline;
  const mature = baselineBt !== null && treatedBt !== null;
  return {
    geologyId: baseline.geologyId,
    matureComparison: mature,
    breakthroughDelaySteps,
    finalWaterCutBaseline,
    finalWaterCutTreated,
    waterCutReductionPctPoints,
    finalRecoveryBaseline,
    finalRecoveryTreated,
    recoveryChangePctPoints,
    oilIndexBaseline,
    oilIndexTreated,
    incrementalOilIndex,
    interpretation: mature
      ? 'Reduced-order same-geology comparison; not a field-calibrated prediction.'
      : 'Pre-breakthrough or incomplete comparison; do not claim conformance benefit.'
  };
}
