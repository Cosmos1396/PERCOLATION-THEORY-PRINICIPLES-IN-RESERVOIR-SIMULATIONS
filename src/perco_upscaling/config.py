from dataclasses import dataclass

@dataclass(frozen=True)
class PercolationConfig:
    connectivity: int = 4  # 2D: 4 or 8; 3D: 6 or 26 (we implement 2D fully; 3D basic support)

@dataclass(frozen=True)
class FlowConfig:
    mu: float = 1.0
    q_in: float = 1.0  # total injection rate (distributed on inlet boundary)
