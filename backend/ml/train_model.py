"""
Model training script for PetSentinel Triage ML.
Pipeline: TF-IDF (char n-grams + word n-grams) → Voting Classifier
  - Logistic Regression (high precision on clinical text)
  - Random Forest (captures non-linear symptom combinations)
  - Gradient Boosting (strong ensemble member)

Run:  python -m ml.train_model
Output: ml/saved_model/triage_pipeline.pkl
        ml/saved_model/label_encoder.pkl
        ml/saved_model/metrics.json
"""
import os
import json
import warnings
import numpy as np
from pathlib import Path

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import joblib

from ml.dataset import get_dataset

warnings.filterwarnings("ignore")

MODEL_DIR = Path(__file__).parent / "saved_model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

PIPELINE_PATH = MODEL_DIR / "triage_pipeline.pkl"
ENCODER_PATH  = MODEL_DIR / "label_encoder.pkl"
METRICS_PATH  = MODEL_DIR / "metrics.json"


from sklearn.neural_network import MLPClassifier

def build_pipeline() -> Pipeline:
    """
    Dual TF-IDF feature union:
    - word_tfidf: word-level unigrams and bigrams
    - char_tfidf: character-level 3–5 grams
    """
    word_tfidf = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        max_features=2500,
        sublinear_tf=True,
        min_df=2,
    )
    char_tfidf = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=2500,
        sublinear_tf=True,
        min_df=2,
    )
    feature_union = FeatureUnion([
        ("word", word_tfidf),
        ("char", char_tfidf),
    ])

    lr = LogisticRegression(
        C=1.5,
        max_iter=1500,
        class_weight="balanced",
        solver="lbfgs",
        multi_class="multinomial",
    )
    rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=15,
        min_samples_leaf=1,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    # Train deep learning model for many iterations to hit 95-97%
    mlp = MLPClassifier(
        hidden_layer_sizes=(150, 50),
        max_iter=3000, 
        alpha=0.005,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1
    )

    # Soft voting averages predicted probabilities — better calibrated
    ensemble = VotingClassifier(
        estimators=[("lr", lr), ("rf", rf), ("mlp", mlp)],
        voting="soft",
        weights=[2, 1, 3],  # MLP gets highest weight for deep patterns
    )

    return Pipeline([
        ("features", feature_union),
        ("clf", ensemble),
    ])


def train():
    print("=" * 60)
    print("  PetSentinel Triage ML — Training Pipeline")
    print("=" * 60)

    texts, labels = get_dataset()
    print(f"\n[DATA] Dataset: {len(texts)} samples")

    # Class distribution
    from collections import Counter
    dist = Counter(labels)
    for cls, cnt in sorted(dist.items()):
        print(f"   {cls:30s}: {cnt:3d} samples")

    # Encode labels
    le = LabelEncoder()
    y = le.fit_transform(labels)
    print(f"\n[LABELS] Classes: {list(le.classes_)}")

    # Cross-validation
    pipeline = build_pipeline()
    print(f"\n[CV] Running 5-fold stratified cross-validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, texts, y, cv=cv, scoring="f1_weighted", n_jobs=-1)
    print(f"   CV F1 (weighted): {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # Full-dataset training
    print("\n[TRAIN] Training on full dataset...")
    pipeline.fit(texts, y)

    # Evaluate on training set (sanity check)
    y_pred = pipeline.predict(texts)
    report_dict = classification_report(
        y, y_pred,
        target_names=le.classes_,
        output_dict=True,
        zero_division=0,
    )
    print("\n[REPORT] Training Classification Report:")
    print(classification_report(y, y_pred, target_names=le.classes_, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y, y_pred, labels=range(len(le.classes_)))
    print("Confusion Matrix (rows=true, cols=predicted):")
    print(f"   Classes: {list(le.classes_)}")
    print(cm)

    # Save artifacts
    joblib.dump(pipeline, PIPELINE_PATH)
    joblib.dump(le, ENCODER_PATH)

    metrics = {
        "cv_f1_weighted_mean": float(cv_scores.mean()),
        "cv_f1_weighted_std": float(cv_scores.std()),
        "train_accuracy": float((y == y_pred).mean()),
        "classification_report": report_dict,
        "classes": list(le.classes_),
        "n_samples": len(texts),
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n[DONE] Artifacts saved to: {MODEL_DIR}")
    print(f"   Pipeline : {PIPELINE_PATH}")
    print(f"   Encoder  : {ENCODER_PATH}")
    print(f"   Metrics  : {METRICS_PATH}")
    print(f"\n[RESULT] CV F1 Weighted: {cv_scores.mean():.4f}")

    return pipeline, le, metrics


if __name__ == "__main__":
    train()
