# EOR Conformance Control Simulator

Interactive 3D **reduced-order research simulator** for studying reservoir heterogeneity, percolation connectivity, pressure-driven displacement and conformance-control concepts.

> **Interpretation boundary:** this project is not a field-calibrated reservoir forecast. Outputs are normalized/reduced-order research quantities unless explicitly stated otherwise. Do not use them as reserves, economics, STB/day forecasts, or treatment-performance predictions.

## What the active browser build actually uses

The active page loads `src/app-fv-v2.js`. Saturation transport is no longer the original stochastic cellular-automata propagation. The current numerical path uses:

- correlated 3D heterogeneous permeability;
- 6-neighbour percolation analysis as a **connectivity diagnostic**;
- a dimensionless transmissibility-weighted pressure solve;
- Corey relative permeability and fractional flow;
- explicit conservative finite-volume water transfer;
- injector replenishment and producer water withdrawal;
- cumulative injected/produced-water accounting and a water-balance residual;
- selective permeability reduction for reduced-order gel/foam conformance experiments;
- stored calculated states for 3D timestep playback and K-layer inspection.

The older CA implementation remains in the repository as development history/research context, but it is **not the active transport model**.

## Numerical accounting and production metrics

Each cell currently has normalized bulk volume 1 and uniform user-controlled porosity `φ`, giving normalized cell pore volume `PV = φ`. Internal FV water transfers are conservative and the application reports the cumulative water-balance residual as a fraction of total PV.

A separate conservative production-accounting module is regression-tested against the FV producer boundary. It calculates phase volumes from the **pre-step fractional-flow state and the same timestep used by transport**, and defines recovery factor as cumulative produced oil divided by normalized initial oil in place.

**Important current integration limitation:** the active browser UI has not yet been switched to that production ledger. Its displayed recovery factor is still the legacy saturation-derived surrogate. Until the ledger is wired into `app-fv-v2.js`, browser RF should not be interpreted as cumulative-produced-oil recovery.

## Flood maturity and scenario comparison

The repository now contains tested infrastructure for physically safer comparisons:

- `run-control.js` classifies early flood, pre-breakthrough and post-breakthrough maturity from injected PVI and breakthrough state;
- `adaptive-runner.js` can continue a case to a target injected PVI and required post-breakthrough observation window with a deterministic safety limit;
- `scenario-comparison.js` requires identical geology IDs and clips both cases to a common injected-PVI horizon before calculating breakthrough delay, water-cut change, recovery change and integrated oil-rate-index change;
- immature comparisons are explicitly labeled **do not claim conformance benefit**.

**Current integration limitation:** the active browser loop still uses a fixed number of simulation steps. Adaptive PVI termination is tested infrastructure, not yet the browser run path.

## EOR/conformance model scope

Available UI selections include waterflood, polymer, CO2 and foam-assisted gas, plus gel/foam conformance treatment. At present these are reduced-order mobility/permeability-response representations. They are **not** mechanistic polymer rheology/adsorption, foam population-balance, gel chemistry, or compositional CO2 models.

Selective treatment reduces permeability in swept, connected high-permeability cells and forces subsequent pressure/transmissibility redistribution. This is useful for research screening of cause-and-effect, but it does not establish field injectivity, placement, retention or treatment longevity.

## Current-build media

The files under `media/current-build/` are retained as historical benchmark media from an earlier development stage. Their polymer/gel metrics were generated before the current matched-PVI, conservative-production workflow was fully integrated. They are useful for regression/history, but **must not be presented as current field-relevant treatment results**.

The next publishable comparison should be regenerated from identical geology using the active FV transport, cumulative production ledger, common injected-PVI horizon and adequate post-breakthrough observation.

## Reproducibility and validation

The default geology uses deterministic seed `137`; `Reset defaults` restores that realization, while `New geology` intentionally changes it.

GitHub Actions executes engineering checks for:

- deterministic benchmark consistency;
- finite-volume water conservation;
- conservative production accounting;
- coupled FV/producer accounting;
- pore-volume run control;
- adaptive flood-horizon behavior;
- same-geology matched-PVI scenario comparison;
- model-card interpretation boundaries;
- active application source/syntax safeguards.

These are **software/numerical regression tests, not validation against field data**.

## Model card

`model-card.json` is the machine-readable interpretation contract. It records the active transport class, deterministic seed, same-geology/matched-PVI comparison requirement, validated numerical claims, missing field physics and prohibited prediction uses. CI checks critical model-governance statements so future changes cannot silently remove them.

## Major missing field physics

The current model does not yet include:

- absolute grid dimensions and dimensional transmissibility;
- heterogeneous porosity;
- PVT / formation-volume factors;
- gravity and capillary pressure;
- rate/BHP well controls and a wellbore model;
- field-calibrated SCAL;
- mechanistic polymer/foam/gel/CO2 physics;
- production-history calibration and uncertainty ensembles.

## Run locally

```bash
cd eor-conformance-simulator
python -m http.server 8000
```

Open `http://localhost:8000`. No build step is required; Plotly is loaded from a CDN.

## Development priorities

1. Wire the conservative production ledger into the active browser FV loop and replace surrogate RF with cumulative-produced-oil RF.
2. Replace fixed-step browser termination with the tested adaptive injected-PVI/post-breakthrough controller.
3. Generate same-geology waterflood / polymer / polymer+gel comparisons at a common mature PVI and publish new benchmark media.
4. Add heterogeneous porosity, dimensional grid geometry and dimensional transmissibility.
5. Add explicit well controls and multiple injector/producer patterns.
6. Add import workflows for permeability/porosity grids and field calibration inputs.
7. Implement mechanistic EOR chemistry/physics only with corresponding validation datasets.
8. Add ensembles, uncertainty distributions and treatment optimization after the deterministic physics path is stable.
