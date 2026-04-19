"""
Worker Agent — deep ML-based symptom analysis.
Uses the trained TF-IDF ensemble to classify symptom severity
and extracts domain-specific features for structured output.
"""
import re
from typing import List, Optional

from models.schemas import WorkerAnalysis, SeverityLevel
from ml.predictor import predict

# Symptom keyword buckets for explainability (not for safety locks — those are supervisor's job)
BODY_SYSTEMS = {
    "gastrointestinal": [
        "vomit", "diarrhea", "stool", "bowel", "defecate", "nausea",
        "bloat", "constipat", "abdomen", "stomach", "intestin",
    ],
    "respiratory": [
        "breath", "cough", "wheeze", "sneez", "nasal", "lung", "chest",
        "pant", "gasp", "inhale",
    ],
    "urinary": [
        "urine", "urinate", "urination", "kidney", "bladder", "litter box",
        "pee ", " pee", "urinary",
    ],
    "musculoskeletal": [
        "limp", "walk", "leg", "paw", "joint", "bone", "muscle", "fracture",
        "stand", "spine", "back",
    ],
    "neurological": [
        "seizure", "tremor", "twitch", "balance", "disoriented", "circle",
        "head tilt", "conscious", "reflex", "nerve",
    ],
    "dermatological": [
        "skin", "scratch", "itch", "rash", "hair loss", "fur", "coat",
        "lump", "sore", "wound", "bite",
    ],
    "cardiovascular": [
        "heart", "pulse", "gum", "pale", "bleed", "blood pressure", "faint",
        "collapse",
    ],
    "ophthalmic": [
        "eye", "vision", "blink", "discharge", "cloudy", "blind",
    ],
    "nutritional": [
        "eat", "food", "appetite", "weight", "diet", "hunger", "water",
        "drink",
    ],
}

DURATION_PATTERNS = [
    (r"\b(\d+)\s*hour", "hours"),
    (r"\b(\d+)\s*day", "days"),
    (r"\b(\d+)\s*week", "weeks"),
    (r"since (yesterday|this morning|last night)", "hours"),
    (r"for a while|for some time", "days"),
]


class WorkerAgent:
    """
    Worker Agent — ML inference + feature extraction for structured output.
    
    Responsibilities:
    - Run trained TF-IDF ensemble on symptom text
    - Map probability to risk score (0.0–1.0)
    - Extract affected body systems from text
    - Compose recommended actions based on ML label
    """

    def analyze(
        self,
        text: str,
        pet_species: Optional[str] = None,
        pet_age_years: Optional[float] = None,
        pet_weight_kg: Optional[float] = None,
    ) -> WorkerAnalysis:
        # ── ML Prediction ─────────────────────────────────────────────────────
        ml_label, confidence, prob_map = predict(text)
        severity = SeverityLevel(ml_label)

        # ── Risk Score — weighted sum of class probabilities ──────────────────
        severity_weights = {"SAFE": 0.0, "MONITOR": 0.33, "URGENT": 0.67, "CRITICAL": 1.0}
        risk_score = sum(
            prob * severity_weights.get(cls, 0.5)
            for cls, prob in prob_map.items()
        )
        # Age/weight modifiers
        if pet_age_years is not None and pet_age_years >= 8:
            risk_score = min(1.0, risk_score + 0.08)  # Senior pet penalty
        if pet_weight_kg is not None and pet_weight_kg < 3:
            risk_score = min(1.0, risk_score + 0.05)  # Small animal penalty

        # ── Symptom detection ─────────────────────────────────────────────────
        text_lower = text.lower()
        detected_symptoms = self._extract_symptoms(text_lower)
        affected_systems = self._detect_body_systems(text_lower)

        # ── Recommended actions ───────────────────────────────────────────────
        actions = self._get_recommendations(severity, pet_species, pet_age_years)

        return WorkerAnalysis(
            symptoms_detected=detected_symptoms,
            body_systems_affected=affected_systems,
            risk_score=round(risk_score, 3),
            ml_predicted_severity=severity,
            ml_confidence=round(confidence, 3),
            recommended_actions=actions,
        )

    def _extract_symptoms(self, text: str) -> List[str]:
        """Naive keyword extraction of symptom phrases from input."""
        symptom_terms = [
            "vomiting", "diarrhea", "lethargy", "not eating", "not drinking",
            "limping", "coughing", "sneezing", "bleeding", "discharge",
            "swelling", "weight loss", "excessive thirst", "frequent urination",
        ]
        return [s for s in symptom_terms if s in text]

    def _detect_body_systems(self, text: str) -> List[str]:
        affected = []
        for system, keywords in BODY_SYSTEMS.items():
            if any(kw in text for kw in keywords):
                affected.append(system)
        return affected if affected else ["general"]

    def _get_recommendations(
        self,
        severity: SeverityLevel,
        species: Optional[str],
        age: Optional[float],
    ) -> List[str]:
        base = {
            SeverityLevel.SAFE: [
                "Monitor your pet's condition over the next 24 hours.",
                "Ensure fresh water is available at all times.",
                "Schedule a routine checkup if symptoms persist beyond 48 hours.",
            ],
            SeverityLevel.MONITOR: [
                "Monitor closely every 2–4 hours.",
                "Keep a symptom log noting frequency and severity.",
                "Call your vet if symptoms worsen or do not improve in 24 hours.",
                "Restrict vigorous activity until assessed.",
                "Ensure hydration — encourage water intake.",
            ],
            SeverityLevel.URGENT: [
                "Call your vet or an emergency clinic today.",
                "Do not wait for the next available appointment — request urgent slot.",
                "Keep your pet calm and warm during transport.",
                "If condition deteriorates significantly, go to emergency directly.",
                "Do not give food or water until vet has assessed.",
            ],
            SeverityLevel.CRITICAL: [
                "Go to an emergency veterinary clinic IMMEDIATELY.",
                "Call ahead so they can prepare for your arrival.",
                "Do not attempt home treatment.",
                "Keep pet still and warm; minimise handling.",
                "You have a very short window — act now.",
            ],
        }
        actions = list(base.get(severity, base[SeverityLevel.MONITOR]))
        # Species-specific additions
        if species and species.lower() == "rabbit" and severity in [SeverityLevel.URGENT, SeverityLevel.CRITICAL]:
            actions.append("Rabbits deteriorate extremely fast — GI stasis is life-threatening within 24 hours.")
        if age is not None and age >= 8:
            actions.append(f"Senior pet ({age:.0f}y): reduced physiological reserve — escalate urgency accordingly.")
        return actions
