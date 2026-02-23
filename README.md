# PERCOLATION-THEORY-PRINICIPLES-IN-RESERVOIR-SIMULATIONS
Percolation-Based Reservoir Upscaling for Heterogeneous Binary Facies Models
# Percolation-Based Reservoir Upscaling (Python)

This project:
- Generates fine-scale heterogeneous permeability fields (binary facies, Gaussian log-k, channels)
- Runs percolation analysis (cluster labeling + spanning detection)
- Upscales to coarse blocks using percolation-informed rules
- Validates via a simple single-phase finite-volume flow solver

## Install
```bash
pip install -e .
