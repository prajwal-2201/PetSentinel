"""
Inference wrapper — loads the trained pipeline at startup and caches it.
Thread-safe singleton pattern so FastAPI workers share one model instance.
"""
import json
from pathlib import Path
from typing import Tuple, Dict, Any
import numpy as np
import joblib

MODEL_DIR    = Path(__file__).parent / "saved_model"
PIPELINE_PATH = MODEL_DIR / "triage_pipeline.pkl"
ENCODER_PATH  = MODEL_DIR / "label_encoder.pkl"
METRICS_PATH  = MODEL_DIR / "metrics.json"

# Module-level singletons (loaded once at import time)
_pipeline = None
_encoder  = None
_metrics: Dict[str, Any] = {}


def _ensure_loaded():
    global _pipeline, _encoder, _metrics
    if _pipeline is None:
        if not PIPELINE_PATH.exists():
            raise FileNotFoundError(
                "Model not trained yet. Run: python -m ml.train_model"
            )
        _pipeline = joblib.load(PIPELINE_PATH)
        _encoder  = joblib.load(ENCODER_PATH)
        if METRICS_PATH.exists():
            with open(METRICS_PATH) as f:
                _metrics = json.load(f)


def predict(text: str) -> Tuple[str, float, Dict[str, float]]:
    """
    Returns:
        severity_label : str  — one of SAFE / MONITOR / URGENT / CRITICAL
        confidence     : float — max probability from the ensemble
        probabilities  : Dict[str, float] — per-class probabilities
    """
    _ensure_loaded()
    proba = _pipeline.predict_proba([text])[0]
    class_idx = int(np.argmax(proba))
    label = _encoder.inverse_transform([class_idx])[0]
    confidence = float(proba[class_idx])
    prob_map = {
        cls: float(p)
        for cls, p in zip(_encoder.classes_, proba)
    }
    return label, confidence, prob_map


def get_model_info() -> Dict[str, Any]:
    """Returns training metadata for the /health endpoint."""
    _ensure_loaded()
    return {
        "model_ready": True,
        "classes": _metrics.get("classes", []),
        "n_training_samples": _metrics.get("n_samples", 0),
        "cv_f1_weighted": _metrics.get("cv_f1_weighted_mean"),
        "train_accuracy": _metrics.get("train_accuracy"),
    }
