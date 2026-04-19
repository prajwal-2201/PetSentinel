"""
/senior-risk endpoint — Senior Pet Risk Assessment.

Risk Formula:
  R = w_age  * f_age  +
      w_mob  * f_mob  +
      w_cond * f_cond +
      w_bmi  * f_bmi  +
      w_symp * f_symp

  With a Geriatric Amplifier: if f_age > 0.70, R *= 1.25 (capped at 1.0)

  Weights: age=0.40, mobility=0.35, conditions=0.12, bmi=0.08, symptoms=0.05

Silver Paws Mode: R > 0.75
Palliative Trigger: R > 0.75
Hospice Consultation: R > 0.90
"""
from fastapi import APIRouter
from typing import List

from models.senior_schemas import (
    SeniorRiskInput, SeniorRiskResponse, RiskFactor, SilverPawsRecommendation
)
from data.legal_data import (
    SPECIES_MAX_AGE, SPECIES_SENIOR_AGE, PALLIATIVE_SPECIALISTS
)

router = APIRouter(prefix="/senior-risk", tags=["senior-care"])

# ── Formula weights (must sum to 1.0) ─────────────────────────────────────────
W_AGE   = 0.40
W_MOB   = 0.35
W_COND  = 0.12
W_BMI   = 0.08
W_SYMP  = 0.05
GERIATRIC_AMPLIFIER_THRESHOLD = 0.70
GERIATRIC_AMPLIFIER = 1.25

SILVER_PAWS_THRESHOLD  = 0.75
HOSPICE_THRESHOLD      = 0.90

# Condition severity weights
CONDITION_SEVERITY_WEIGHTS = {"mild": 0.25, "moderate": 0.65, "severe": 1.0}


def compute_age_factor(age_years: float, species: str) -> tuple[float, str]:
    """
    Age factor: 0.0 for juvenile, 1.0 for at/beyond max expected lifespan.
    Uses log-exponential scale: senior years carry exponentially higher risk.

    For 17yr dog (max=20, senior=7): factor = ((17-7)/(20-7))^1.3 = (10/13)^1.3 ≈ 0.73
    With geriatric amplifier: 0.73 > 0.70 → R *= 1.25
    """
    max_age    = SPECIES_MAX_AGE.get(species.lower(), 15.0)
    senior_age = SPECIES_SENIOR_AGE.get(species.lower(), 7.0)

    if age_years < senior_age:
        raw = 0.0
        interp = f"Below senior threshold ({senior_age}yr for {species}). Routine care."
    else:
        proportion = (age_years - senior_age) / max(max_age - senior_age, 1)
        raw = min(proportion ** 1.3, 1.0)   # power > 1 = exponential risk curve
        if raw >= 0.90:
            interp = f"GERIATRIC EXTREME — {age_years}yr {species} is in the final phase of natural lifespan."
        elif raw >= 0.70:
            interp = f"GERIATRIC — {age_years}yr is significantly advanced. Senior-specialist care essential."
        elif raw >= 0.40:
            interp = f"SENIOR — {age_years}yr. Regular geriatric monitoring recommended every 3 months."
        else:
            interp = f"EARLY SENIOR — {age_years}yr. Annual senior wellness panels advised."

    return min(raw, 1.0), interp


def compute_mobility_factor(mobility_score: int, tracking: dict) -> tuple[float, str]:
    """
    Mobility score 0 (fully mobile) → 10 (immobile).
    Tracker data (steps, rest hours) can elevate the score.
    """
    base = mobility_score / 10.0

    # Tracker adjustments
    boost = 0.0
    if tracking.get("daily_steps") is not None:
        steps = tracking["daily_steps"]
        if steps < 500:
            boost += 0.15
        elif steps < 1500:
            boost += 0.08
    if tracking.get("avg_rest_hours") is not None:
        rest = tracking["avg_rest_hours"]
        if rest > 20:
            boost += 0.15
        elif rest > 16:
            boost += 0.07
    if tracking.get("pain_vocalization"):
        boost += 0.12
    if tracking.get("weight_change_kg_per_month") is not None:
        loss = tracking["weight_change_kg_per_month"]
        if loss < -0.3:
            boost += 0.10
        elif loss < -0.1:
            boost += 0.05

    factor = min(base + boost, 1.0)

    if factor >= 0.80:
        interp = "CRITICAL MOBILITY IMPAIRMENT — pet requires total mobility support and pressure sore prevention."
    elif factor >= 0.60:
        interp = "SEVERE MOBILITY DECLINE — cannot navigate stairs/outdoors independently. Physiotherapy urgent."
    elif factor >= 0.40:
        interp = "MODERATE MOBILITY LIMITATION — restricted activity, assisted transitions needed."
    elif factor >= 0.20:
        interp = "MILD MOBILITY REDUCTION — monitor for progressive decline."
    else:
        interp = "NORMAL MOBILITY — no significant restriction detected."

    return factor, interp


def compute_condition_factor(conditions: list) -> tuple[float, str]:
    if not conditions:
        return 0.0, "No diagnosed chronic conditions."
    total = sum(
        CONDITION_SEVERITY_WEIGHTS.get(c.severity.lower(), 0.5)
        for c in conditions
    )
    max_score = len(conditions)
    factor = min(total / max(max_score, 1), 1.0) * min(len(conditions) / 4.0, 1.0)
    names = [c.name for c in conditions]
    return min(factor, 1.0), f"Active conditions: {', '.join(names)}."


def compute_bmi_factor(weight_kg: float, ideal_kg: float | None, species: str) -> tuple[float, str]:
    if ideal_kg is None:
        return 0.0, "Ideal weight not provided — BMI factor skipped."
    if ideal_kg <= 0:
        return 0.0, "Invalid ideal weight."
    deviation = abs(weight_kg - ideal_kg) / ideal_kg
    factor = min(deviation, 1.0)
    direction = "underweight" if weight_kg < ideal_kg else "overweight"
    pct = round(deviation * 100, 1)
    if factor > 0.25:
        interp = f"SIGNIFICANT: {pct}% {direction} — increases organ stress and mobility pain."
    elif factor > 0.10:
        interp = f"MODERATE: {pct}% {direction} — monitor and adjust diet."
    else:
        interp = f"WITHIN RANGE: {pct}% {direction} — acceptable."
    return factor, interp


def compute_symptom_factor(symptom_text: str | None) -> tuple[float, str]:
    if not symptom_text:
        return 0.0, "No recent symptoms reported."
    # Import predictor lazily so startup doesn't block if model not trained
    try:
        from ml.predictor import predict
        label, confidence, prob_map = predict(symptom_text)
        weights = {"SAFE": 0.0, "MONITOR": 0.33, "URGENT": 0.67, "CRITICAL": 1.0}
        factor = sum(p * weights.get(c, 0.5) for c, p in prob_map.items())
        interp = f"ML severity: {label} (confidence {confidence:.0%}) — {symptom_text[:60]}..."
        return min(factor, 1.0), interp
    except Exception:
        return 0.2, f"Symptoms noted but ML model unavailable: '{symptom_text[:60]}'"


def build_recommendations(
    risk_score: float,
    mobility_factor: float,
    age_years: float,
    species: str,
) -> List[SilverPawsRecommendation]:
    recs = []

    if risk_score >= HOSPICE_THRESHOLD:
        recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["hospice"]))
        recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["pain_management"]))
    elif risk_score >= SILVER_PAWS_THRESHOLD:
        recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["palliative_home"]))
        recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["geriatric_vet"]))
        if mobility_factor >= 0.50:
            recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["physio"]))
    else:
        recs.append(SilverPawsRecommendation(**PALLIATIVE_SPECIALISTS["geriatric_vet"]))

    return recs


@router.post("", response_model=SeniorRiskResponse, summary="Senior pet risk assessment")
async def assess_senior_risk(payload: SeniorRiskInput) -> SeniorRiskResponse:
    species = payload.species.lower()

    # ── Compute individual factors ─────────────────────────────────────────────
    f_age, age_interp = compute_age_factor(payload.age_years, species)

    tracking_data = {
        "daily_steps": payload.daily_steps,
        "avg_rest_hours": payload.avg_rest_hours,
        "pain_vocalization": payload.pain_vocalization,
        "weight_change_kg_per_month": payload.weight_change_kg_per_month,
    }
    f_mob,  mob_interp  = compute_mobility_factor(payload.mobility_score, tracking_data)
    f_cond, cond_interp = compute_condition_factor(payload.known_conditions)
    f_bmi,  bmi_interp  = compute_bmi_factor(payload.weight_kg, payload.ideal_weight_kg, species)
    f_symp, symp_interp = compute_symptom_factor(payload.recent_symptoms)

    # ── Weighted sum (R) ───────────────────────────────────────────────────────
    R_raw = (
        W_AGE  * f_age  +
        W_MOB  * f_mob  +
        W_COND * f_cond +
        W_BMI  * f_bmi  +
        W_SYMP * f_symp
    )

    # Geriatric amplifier — kicks in when age factor is severely elevated
    amplified = False
    if f_age >= GERIATRIC_AMPLIFIER_THRESHOLD:
        R_raw = R_raw * GERIATRIC_AMPLIFIER
        amplified = True

    R = min(round(R_raw, 4), 1.0)

    # ── Risk tier ──────────────────────────────────────────────────────────────
    if R >= 0.90:
        risk_tier = "GERIATRIC_CRITICAL"
        next_assessment_days = 3
    elif R >= 0.75:
        risk_tier = "HIGH"
        next_assessment_days = 7
    elif R >= 0.50:
        risk_tier = "MODERATE"
        next_assessment_days = 30
    else:
        risk_tier = "LOW"
        next_assessment_days = 90

    silver_paws = R >= SILVER_PAWS_THRESHOLD
    ui_state = "silver_paws" if silver_paws else ("senior_monitor" if R >= 0.50 else "routine")

    # ── Build structured risk factors ─────────────────────────────────────────
    risk_factors = [
        RiskFactor(name="Age Risk",       raw_value=payload.age_years,     normalized_score=f_age,  weight=W_AGE,  contribution=round(W_AGE*f_age, 4),  interpretation=age_interp),
        RiskFactor(name="Mobility Risk",  raw_value=payload.mobility_score, normalized_score=f_mob,  weight=W_MOB,  contribution=round(W_MOB*f_mob, 4),   interpretation=mob_interp),
        RiskFactor(name="Condition Risk", raw_value=len(payload.known_conditions), normalized_score=f_cond, weight=W_COND, contribution=round(W_COND*f_cond, 4), interpretation=cond_interp),
        RiskFactor(name="BMI/Weight Risk",raw_value=payload.weight_kg,     normalized_score=f_bmi,  weight=W_BMI,  contribution=round(W_BMI*f_bmi, 4),   interpretation=bmi_interp),
        RiskFactor(name="Symptom Risk",   raw_value=0.0,                   normalized_score=f_symp, weight=W_SYMP, contribution=round(W_SYMP*f_symp, 4),  interpretation=symp_interp),
    ]

    recommendations = build_recommendations(R, f_mob, payload.age_years, species)

    # ── Mobility narrative (17yr dog use-case) ────────────────────────────────
    if payload.daily_steps is not None:
        steps_ctx = f"Daily step count: {payload.daily_steps} (target for senior {species}: 2,000–3,000)."
    else:
        steps_ctx = "No step tracker data. Consider adding a pet activity tracker."
    if payload.weight_change_kg_per_month and payload.weight_change_kg_per_month < 0:
        weight_ctx = f"Weight loss of {abs(payload.weight_change_kg_per_month):.2f}kg/month detected — sarcopenia risk."
    else:
        weight_ctx = "No significant weight change noted."
    amplifier_note = f" Geriatric amplifier applied (x{GERIATRIC_AMPLIFIER}) due to extreme age." if amplified else ""
    mobility_insight = (
        f"Risk Score R = {R:.3f}.{amplifier_note} {mob_interp} {steps_ctx} {weight_ctx}"
    )

    return SeniorRiskResponse(
        pet_name=payload.pet_name,
        species=species,
        age_years=payload.age_years,
        risk_score=R,
        risk_tier=risk_tier,
        silver_paws_mode=silver_paws,
        ui_state=ui_state,
        risk_factors=risk_factors,
        recommendations=recommendations,
        mobility_insight=mobility_insight,
        palliative_triggered=silver_paws,
        next_assessment_days=next_assessment_days,
    )
