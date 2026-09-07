# EOR Conformance Control Simulator

Interactive 3D reduced-order reservoir simulator that combines **percolation theory**, **cellular automata (CA)** and a **pressure-driven transmissibility model** to study EOR conformance-control concepts.

## Current physics

- Generates a correlated 3D heterogeneous permeability field.
- Uses 6-neighbour connectivity to identify injector-to-producer high-permeability spanning clusters.
- Solves a dimensionless steady pressure field between injector and producer faces with iterative transmissibility weighting.
- Uses harmonic permeability and phase mobility to calculate Darcy-like positive cell-to-cell flux weights.
- Advances water saturation stochastically with a CA rule weighted by local pressure drop and transmissibility.
- Enforces irreducible water saturation `Swi` and residual oil saturation `Sor`.
- Uses Corey relative-permeability curves:
  - `krw = Se^nw`
  - `kro = (1-Se)^no`
  - `Se = (Sw-Swi)/(1-Swi-Sor)`
- Calculates producer water cut from phase fractional flow rather than directly from saturation.
- Applies selective gel/foam treatment to swept, connected high-permeability cells.
- Re-solves pressure after treatment so permeability reduction can redistribute subsequent flow.
- Reports relative oil-rate index, water cut, recovery factor, sweep and breakthrough.

## EOR modes

- Waterflood
- Polymer flood
- CO2 flood
- Foam-assisted gas flood

The EOR selections currently modify reduced-order mobility/spread factors. They are not yet mechanistic polymer, foam or compositional modules.

## Main controls

| Control | Physical interpretation |
|---|---|
| High-permeability fraction | Amount of conductive rock / percolation occupancy |
| Permeability contrast | Severity of preferential flow paths |
| Spatial correlation | Continuity of connected high-permeability regions |
| Mobility ratio | Relative displacement stability |
| CA propagation probability | Stochastic transport scaling |
| Swi | Irreducible water saturation |
| Sor | Residual oil saturation |
| Corey `nw` | Water relative-permeability curvature |
| Corey `no` | Oil relative-permeability curvature |
| Treatment strength | Permeability reduction in targeted cells |
| Treatment start step | Timing of conformance intervention |
| Channel targeting percentile | Selectivity of treatment placement |

## Pressure / transport concept

For each connection, phase mobility is calculated from the current saturation and Corey curves. Effective total mobility is combined with permeability, and a harmonic connection transmissibility is formed. The pressure field is solved iteratively with fixed dimensionless pressure at the injector and producer faces and no-flow behavior on the remaining outer boundaries.

The CA transition probability is then weighted by positive local pressure-driven flux. This makes conformance treatment more physically meaningful than simply changing a CA probability: reducing permeability in a treated high-flow path changes the pressure solution and therefore the relative attractiveness of alternative pathways.

## Reproducibility

The default realization uses a deterministic seeded pseudo-random generator. `Reset defaults` restores that seed. `New geology` intentionally changes the seed to generate a different realization.

## Run locally

```bash
cd eor-conformance-simulator
python -m http.server 8000
```

Then open `http://localhost:8000`.

No build step is required. Plotly is loaded from a CDN.

## Interpretation boundary

This remains a **reduced-order research simulator**. Pressure and fractional-flow physics improve causal behavior, but it is not a replacement for a fully implicit finite-volume black-oil/compositional/thermal simulator. The current rate axis is a **relative rate index**, not STB/day. Results should not be presented as field forecasts unless calibrated to reservoir geometry, porosity, absolute permeability, PVT/SCAL, well controls and production history.

## Development priorities

1. Add deterministic numerical regression tests and conservation diagnostics.
2. Add side-by-side baseline vs treatment scenarios on the same geology.
3. Add cell pore volume/porosity and explicit material-balance reporting.
4. Import permeability/porosity grids (CSV/GRDECL-style workflow).
5. Add multiple injector/producer patterns and well controls.
6. Implement mechanistic polymer rheology/adsorption and foam mobility reduction.
7. Add ensembles, uncertainty distributions and treatment optimization.
