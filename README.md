# PERCOLATION-THEORY-PRINICIPLES-IN-RESERVOIR-SIMULATIONS

Percolation-Based Reservoir Upscaling for Heterogeneous Binary Facies Models.

## Percolation-Based Reservoir Upscaling (Python)

This project:
- Generates fine-scale heterogeneous permeability fields (binary facies, Gaussian log-k, channels)
- Runs percolation analysis (cluster labeling + spanning detection)
- Upscales to coarse blocks using percolation-informed rules
- Validates via a simple single-phase finite-volume flow solver

## Interactive EOR Conformance Control Simulator

A new browser-based simulator is available in [`eor-conformance-simulator/`](./eor-conformance-simulator/README.md).

It combines:
- 3D correlated heterogeneous reservoir generation
- percolating high-permeability cluster detection
- cellular-automata displacement
- waterflood, polymer, CO2 and foam EOR modes
- selective gel/foam conformance treatment
- interactive 3D permeability/saturation/treatment visualization
- production response plots for oil rate, water cut, recovery factor and breakthrough
- user-adjustable hyperparameters for cause-and-effect experiments

## Install Python package

```bash
pip install -e .
```
