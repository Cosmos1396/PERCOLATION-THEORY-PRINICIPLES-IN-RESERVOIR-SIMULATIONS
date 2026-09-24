import { conservativeWaterStep } from './transport.js';
import { producerStepVolumes, accumulateProduction } from './production-accounting.js';

/**
 * Advance one reduced-order FV timestep while keeping producer phase accounting
 * on the exact same pre-step saturation state, outflows and dt used by transport.
 *
 * This orchestration layer prevents the browser/application from accidentally
 * calculating water cut from post-step saturation or a different timestep.
 * Volumes remain normalized reservoir-volume quantities, not field barrels.
 */
export function coupledProductionStep({
  sw,
  pv,
  fluxes,
  producerOutflows,
  fractionalFlow,
  swi,
  maxSw,
  inletIndices,
  courant,
  previousProduction,
  ooip
}) {
  const transport = conservativeWaterStep({
    sw,
    pv,
    fluxes,
    producerOutflows,
    fractionalFlow,
    swi,
    maxSw,
    inletIndices,
    courant
  });

  const phaseVolumes = producerStepVolumes({
    producerOutflows,
    sw,
    dt: transport.dt,
    fractionalFlow
  });

  const production = accumulateProduction(previousProduction, phaseVolumes, ooip);
  const tolerance = 1e-10 * Math.max(1, Math.abs(transport.producedWater));
  const waterMismatch = phaseVolumes.water - transport.producedWater;

  if (Math.abs(waterMismatch) > tolerance) {
    throw new Error(`Producer water accounting diverged from FV transport by ${waterMismatch}`);
  }

  return {
    transport,
    phaseVolumes,
    production,
    waterMismatch
  };
}
