# EOR Conformance Control Simulator

Interactive 3D reduced-order reservoir simulator that combines **percolation theory** and **cellular automata (CA)** to study conformance-control concepts for EOR.

## What it does

- Builds a correlated 3D heterogeneous permeability field.
- Defines high-permeability cells from a user-controlled fraction.
- Uses 6-neighbour connectivity to identify injector-to-producer spanning clusters.
- Propagates an injected phase with a stochastic CA transition rule that responds to local transmissibility, direction, mobility ratio and EOR process.
- Applies selective gel/foam conformance treatment to high-permeability cells in the active spanning cluster.
- Reduces treated-cell effective permeability, which changes later CA propagation.
- Correlates the evolving reservoir state with oil rate, water cut, recovery factor and breakthrough.
- Provides switchable 3D views for injected-phase saturation, permeability, percolating cluster and treatment placement.

## EOR modes

- Waterflood
- Polymer flood
- CO2 flood
- Foam-assisted gas flood

The modes are represented through reduced-order mobility/spread/oil-response factors. They are intended for causal exploration, not calibrated field prediction.

## Main hyperparameters

| Control | Physical interpretation |
|---|---|
| High-permeability fraction | Occupancy probability / amount of conductive rock |
| Permeability contrast | Severity of preferential flow paths |
| Spatial correlation | Continuity of high-permeability cells |
| Mobility ratio | Viscous displacement stability |
| CA propagation probability | Base probability of front advance |
| Treatment strength | Reduction of effective permeability in targeted cells |
| Treatment start step | Timing of conformance intervention |
| Channel targeting percentile | Selectivity of treatment placement |

## Model concept

For adjacent cells `i` and `j`, a harmonic-mean-like local transmissibility is calculated from effective permeability. The stochastic transition probability is then modified by:

- local transmissibility,
- forward/backward direction bias,
- effective mobility ratio,
- EOR-process factor,
- current injected-phase saturation.

A random draw determines whether the CA front advances. The conformance treatment changes `k_eff` in selected connected high-flow cells, so subsequent propagation and production response change dynamically.

The percolation test starts from the injector face and performs a breadth-first search through high-permeability cells. A spanning cluster exists when that connected component reaches the producer face.

## Run locally

Because the app uses ES modules, serve the directory rather than double-clicking the HTML file:

```bash
cd eor-conformance-simulator
python -m http.server 8000
```

Then open `http://localhost:8000`.

No build step is required. Plotly is loaded from a CDN.

## GitHub Pages

The folder is a static web app and can be published with GitHub Pages (or copied to a standalone repository and deployed directly).

## Important limitation

This is an **educational/research reduced-order simulator**. It is not a replacement for a finite-volume compositional/thermal reservoir simulator. Absolute rates and recovery values are illustrative unless the model is calibrated against a specific reservoir, PVT/SCAL data, well controls and historical production.

## Suggested next developments

1. Replace heuristic production mapping with a finite-volume pressure/transport solve.
2. Import real permeability/porosity grids (CSV/GRDECL).
3. Add relative permeability and capillary-pressure curves.
4. Add well controls and multiple injector/producer patterns.
5. Add polymer adsorption/rheology, foam texture, or CO2 miscibility modules.
6. Add ensemble runs and uncertainty distributions.
7. Add history matching / optimization of treatment placement.
