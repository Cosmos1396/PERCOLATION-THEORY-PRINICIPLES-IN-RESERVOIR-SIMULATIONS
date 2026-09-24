/**
 * Conservative producer accounting for the reduced-order FV simulator.
 * Volumes are normalized reservoir-volume units. This module deliberately
 * avoids field-rate units until geometry, PVT and well controls are calibrated.
 */
export function producerStepVolumes({ producerOutflows, sw, dt, fractionalFlow }) {
  if (!(dt >= 0) || !Number.isFinite(dt)) throw new RangeError('dt must be finite and >= 0');
  let liquid = 0, water = 0, oil = 0;
  for (const [cell, q] of producerOutflows) {
    if (!(q > 0)) continue;
    const fw = Math.max(0, Math.min(1, fractionalFlow(sw[cell])));
    const dL = q * dt;
    liquid += dL;
    water += dL * fw;
    oil += dL * (1 - fw);
  }
  return { liquid, water, oil, waterCut: liquid > 0 ? water / liquid : 0 };
}

export function initialOilInPlace({ pv, swi }) {
  if (!(swi >= 0 && swi < 1)) throw new RangeError('swi must be in [0,1)');
  let ooip = 0;
  for (const cellPv of pv) {
    if (!(cellPv >= 0) || !Number.isFinite(cellPv)) throw new RangeError('pore volumes must be finite and >= 0');
    ooip += cellPv * (1 - swi);
  }
  return ooip;
}

export function accumulateProduction(previous, stepVolumes, ooip) {
  if (!(ooip > 0) || !Number.isFinite(ooip)) throw new RangeError('ooip must be finite and > 0');
  const cumulativeOil = (previous?.cumulativeOil || 0) + stepVolumes.oil;
  const cumulativeWater = (previous?.cumulativeWater || 0) + stepVolumes.water;
  const cumulativeLiquid = (previous?.cumulativeLiquid || 0) + stepVolumes.liquid;
  return {
    cumulativeOil,
    cumulativeWater,
    cumulativeLiquid,
    recoveryFactor: cumulativeOil / ooip,
    waterCut: stepVolumes.waterCut
  };
}
