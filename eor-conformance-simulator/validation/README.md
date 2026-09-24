# Engineering validation

This directory contains deterministic regression and source checks for the current simulator build.

## Run

From `eor-conformance-simulator`:

```bash
node validation/validate-benchmark.mjs
node validation/validate-app-source.mjs
```

`validate-benchmark.mjs` reads `media/current-build/case_metrics.csv` and checks that the untreated and gel-treatment cases remain comparable on the same connected geology and that the currently published qualitative treatment response has not silently reversed.

`validate-app-source.mjs` runs Node's JavaScript syntax check and guards the production-history sweep metric against the undefined-identifier regression that previously stopped the browser simulation during execution.

Current acceptance checks:

- identical connected high-permeability fraction for untreated and treated cases;
- zero treated cells in the untreated case;
- non-zero treatment placement in the gel case;
- treatment does not advance breakthrough;
- treatment does not increase final water cut;
- recovery-factor difference stays within the deliberately narrow reduced-order regression tolerance;
- application JavaScript parses successfully;
- production history stores the computed `sweep` value and does not reference the stale undefined `swept` identifier.

## Interpretation

These are **regression checks, not model-validation against field data**. Passing them means the committed benchmark and application source are internally consistent with the published reduced-order behavior. It does not prove grid convergence, material-balance conservation, history-match quality, polymer/gel mechanistic validity, or field predictive accuracy.

The next physics-validation milestone is explicit cell pore volume/porosity and a conservation residual so the simulator can quantify how far the stochastic CA transport departs from a conservative finite-volume formulation.
