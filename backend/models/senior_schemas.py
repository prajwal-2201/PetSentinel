"""
Pydantic schemas for the Senior Risk Assessment endpoint.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class MobilityLevel(int, Enum):
    """
    0 = Fully mobile — runs, jumps, climbs stairs easily
    2 = Reduced mobility — walks normally, avoids stairs
    4 = Assisted mobility — needs help rising, short walks only
    6 = Severely impaired — cannot walk unaided, mostly recumbent
    8 = Near-immobile — can shift position only, requires total care
    10 = Immobile — fully recumbent
    """
    FULLY_MOBILE     = 0
    REDUCED          = 2
    ASSISTED         = 4
    SEVERELY_IMPAIRED = 6
    NEAR_IMMOBILE    = 8
    IMMOBILE         = 10


class KnownCondition(BaseModel):
    name: str
    severity: str  # "mild" | "moderate" | "severe"
    diagnosed_years_ago: float = 0.0


class SeniorRiskInput(BaseModel):
    pet_id: Optional[str] = None
    pet_name: str = Field(..., description="Pet's name")
    species: str = Field(default="dog", description="dog | cat | rabbit | bird | other")
    age_years: float = Field(..., ge=0.0, le=50.0, description="Current age in years")
    weight_kg: float = Field(..., gt=0.0, description="Current weight in kg")
    ideal_weight_kg: Optional[float] = Field(None, description="Vet-prescribed ideal weight")

    mobility_score: int = Field(
        ..., ge=0, le=10,
        description="0=fully mobile, 10=completely immobile"
    )
    known_conditions: List[KnownCondition] = Field(
        default_factory=list,
        description="Any diagnosed chronic conditions"
    )
    recent_symptoms: Optional[str] = Field(
        None,
        description="Free-text recent symptom description (fed to triage ML)"
    )

    # Mobility tracking fields for geriatric dogs
    daily_steps: Optional[int] = Field(None, description="Average steps per day from tracker")
    avg_rest_hours: Optional[float] = Field(None, description="Daily hours of rest/sleeping")
    pain_vocalization: Optional[bool] = Field(None, description="Pet vocalizes pain during movement")
    weight_change_kg_per_month: Optional[float] = Field(None, description="Weight change (negative = loss)")


class RiskFactor(BaseModel):
    name: str
    raw_value: float
    normalized_score: float   # 0.0–1.0
    weight: float             # contribution weight in formula
    contribution: float       # normalized_score * weight
    interpretation: str


class SilverPawsRecommendation(BaseModel):
    specialist_type: str
    action: str
    urgency: str             # "routine" | "soon" | "urgent"
    description: str
    contact_type: str        # "home_visit" | "clinic" | "telehealth"


class SeniorRiskResponse(BaseModel):
    pet_name: str
    species: str
    age_years: float
    risk_score: float                    # R — final weighted score 0.0–1.0
    risk_tier: str                       # GERIATRIC_CRITICAL / HIGH / MODERATE / LOW
    silver_paws_mode: bool               # True if R > 0.75
    ui_state: str                        # "silver_paws" | "senior_monitor" | "routine"
    risk_factors: List[RiskFactor]
    recommendations: List[SilverPawsRecommendation]
    mobility_insight: str                # Narrative for the 17yr dog use-case
    palliative_triggered: bool
    next_assessment_days: int            # When to reassess
