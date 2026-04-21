from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class SeverityLevel(str, Enum):
    SAFE = "SAFE"
    MONITOR = "MONITOR"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"
    MANDATORY_SAFETY_LOCK = "MANDATORY_SAFETY_LOCK"


class SymptomInput(BaseModel):
    input: str = Field(..., description="Raw user symptom description", min_length=3)
    pet_species: Optional[str] = Field(None, description="Species e.g. dog, cat, rabbit")
    pet_age_years: Optional[float] = Field(None, description="Pet age in years")
    pet_weight_kg: Optional[float] = Field(None, description="Pet weight in kg")
    health_context: Optional[str] = Field(None, description="Summary of pet medical history/records")


class SafetyInstruction(BaseModel):
    code: str          # Machine-readable code e.g. DO_NOT_FORCE_FEED
    message: str       # Human-readable instruction
    priority: int      # 1 = highest


class WorkerAnalysis(BaseModel):
    symptoms_detected: List[str]
    body_systems_affected: List[str]
    risk_score: float              # 0.0 – 1.0
    ml_predicted_severity: SeverityLevel
    ml_confidence: float           # 0.0 – 1.0
    recommended_actions: List[str]


class TriageResponse(BaseModel):
    status: SeverityLevel
    severity_label: str
    triggered_by: str              # "supervisor_rule" | "ml_model"
    triggered_keywords: List[str]
    safety_instructions: List[SafetyInstruction]
    worker_analysis: Optional[WorkerAnalysis] = None
    next_action: str
    ui_override: bool              # True means frontend must show emergency screen
    session_id: str
