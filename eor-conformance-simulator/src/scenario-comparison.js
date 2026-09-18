const finite = v => Number.isFinite(v);

function validateHistory(history, label) {
  if (!Array.isArray(history) || history.length === 0) throw new Error(`${label} history must be non-empty`);
  let previous = -Infinity;
  for (const row of history) {
    if (!finite(row.injectedPvi)) throw new Error(`${label} history requires finite injectedPvi`);
    if (row.injectedPvi + 1e-12 < previous) throw new Error(`${label} injectedPvi must be non-decreasing`);
    previous = row.injectedPvi;
  }
}

function valueAtPvi(history, key, target) {
  if (target <= history[0].injectedPvi) return history[0][key] ?? 0;
  for (let i = 1; i < history.length; i++) {
    const a = history[i - 1], b = history[i];
    if (target <= b.injectedPvi + 1e-12) {
      const dx = b.injectedPvi - a.injectedPvi;
      if (dx <= 1e-12) return b[key] ?? a[key] ?? 0;
      const f = (target - a.injectedPvi) / dx;
      return (a[key] ?? 0) + f * ((b[key] ?? 0) - (a[key] ?? 0));
    }
  }
  return history[history.length - 1][key] ?? 0;
}

function integrateToPvi(history, key, target) {
  let total = 0;
  for (let i = 1; i < history.length; i++) {
    const a = history[i - 1], b = history[i];
    if (a.injectedPvi >= target) break;
    const right = Math.min(b.injectedPvi, target);
    const dx = right - a.injectedPvi;
    if (dx > 0) {
      const ya = finite(a[key]) ? a[key] : 0;
      const yb = valueAtPvi(history, key, right);
      total += 0.5 * (ya + yb) * dx;
    }
    if (b.injectedPvi >= target) break;
  }
  return total;
}

function breakthroughPvi(scenario, threshold) {
  const h = scenario.history;
  const index = Number.isInteger(scenario.breakthroughStep) && scenario.breakthroughStep >= 0
    ? Math.min(scenario.breakthroughStep, h.length - 1)
    : h.findIndex(r => (r.wc ?? r.waterCut ?? 0) >= threshold);
  return index >= 0 ? h[index].injectedPvi : null;
}

/**
 * Compare scenarios on identical geology and at the same injected pore-volume horizon.
 * This avoids creating apparent incremental oil or water-cut benefit merely because one
 * case was simulated farther than the other. Outputs remain reduced-order screening metrics.
 */
export function compareScenarios({ baseline, treated, waterCutThreshold = 0.10 }) {
  if (!baseline || !treated) throw new Error('baseline and treated scenarios are required');
  if (!baseline.geologyId || baseline.geologyId !== treated.geologyId) throw new Error('same-geology comparison required');
  validateHistory(baseline.history, 'baseline');
  validateHistory(treated.history, 'treated');

  const bh = baseline.history, th = treated.history;
  const commonPvi = Math.min(bh[bh.length - 1].injectedPvi, th[th.length - 1].injectedPvi);
  const bBtPvi = breakthroughPvi(baseline, waterCutThreshold);
  const tBtPvi = breakthroughPvi(treated, waterCutThreshold);
  const bothBreakthroughByCommonPvi = bBtPvi !== null && tBtPvi !== null && bBtPvi <= commonPvi && tBtPvi <= commonPvi;

  const finalWaterCutBaseline = valueAtPvi(bh, 'wc', commonPvi);
  const finalWaterCutTreated = valueAtPvi(th, 'wc', commonPvi);
  const finalRecoveryBaseline = valueAtPvi(bh, 'rf', commonPvi);
  const finalRecoveryTreated = valueAtPvi(th, 'rf', commonPvi);
  const oilIndexBaseline = integrateToPvi(bh, 'qo', commonPvi);
  const oilIndexTreated = integrateToPvi(th, 'qo', commonPvi);

  return {
    geologyId: baseline.geologyId,
    comparisonInjectedPvi: commonPvi,
    matureComparison: bothBreakthroughByCommonPvi,
    baselineBreakthroughPvi: bBtPvi,
    treatedBreakthroughPvi: tBtPvi,
    breakthroughDelayPvi: bBtPvi !== null && tBtPvi !== null ? tBtPvi - bBtPvi : null,
    finalWaterCutBaseline,
    finalWaterCutTreated,
    waterCutReductionPctPoints: 100 * (finalWaterCutBaseline - finalWaterCutTreated),
    finalRecoveryBaseline,
    finalRecoveryTreated,
    recoveryChangePctPoints: 100 * (finalRecoveryTreated - finalRecoveryBaseline),
    oilIndexBaseline,
    oilIndexTreated,
    incrementalOilIndex: oilIndexTreated - oilIndexBaseline,
    interpretation: bothBreakthroughByCommonPvi
      ? `Reduced-order same-geology comparison at matched ${commonPvi.toFixed(3)} PVI; not a field-calibrated prediction.`
      : `Matched-PVI comparison is pre-breakthrough or incomplete at ${commonPvi.toFixed(3)} PVI; do not claim conformance benefit.`
  };
}
