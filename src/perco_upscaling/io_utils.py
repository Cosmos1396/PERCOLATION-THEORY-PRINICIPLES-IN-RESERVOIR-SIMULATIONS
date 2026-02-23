from __future__ import annotations
import os
import numpy as np

def ensure_dir(path: str) -> str:
    os.makedirs(path, exist_ok=True)
    return path

def save_npz(path: str, **arrays) -> None:
    np.savez_compressed(path, **arrays)

def load_npz(path: str) -> dict:
    data = np.load(path, allow_pickle=False)
    return {k: data[k] for k in data.files}
