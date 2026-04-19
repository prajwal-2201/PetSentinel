"""
Supervisor Agent — first line of defense.
1. Checks for MANDATORY_SAFETY_LOCK keywords (rule-based, fast)
2. If triggered: returns immediately with Safety Instruction Set
3. If clean: delegates to Worker Agent for ML-based analysis
"""
import uuid
from typing import Tuple, List

from models.schemas import (
    TriageResponse, SeverityLevel, SafetyInstruction, WorkerAnalysis
)
from data.symptom_rules import detect_safety_locks, get_safety_instructions
from agents.worker import WorkerAgent

_worker = WorkerAgent()

SEVERITY_LABELS = {
    SeverityLevel.MANDATORY_SAFETY_LOCK: "MANDATORY SAFETY LOCK — Emergency Override Active",
    SeverityLevel.CRITICAL:              "CRITICAL — Go to Emergency Vet NOW",
    SeverityLevel.URGENT:                "URGENT — See Vet Within Hours",
    SeverityLevel.MONITOR:               "MONITOR — Watch Closely for 24 Hours",
    SeverityLevel.SAFE:                  "SAFE — Routine Care Advised",
}

NEXT_ACTIONS = {
    SeverityLevel.MANDATORY_SAFETY_LOCK: "CONTACT_VET_IMMEDIATELY",
    SeverityLevel.CRITICAL:              "GO_TO_EMERGENCY_VET",
    SeverityLevel.URGENT:                "CALL_VET_WITHIN_HOURS",
    SeverityLevel.MONITOR:               "MONITOR_AND_CALL_IF_WORSENS",
    SeverityLevel.SAFE:                  "SCHEDULE_ROUTINE_CHECKUP",
}


class SupervisorAgent:
    """
    Supervisor Agent — orchestrates the triage pipeline.
    
    Decision flow:
        Input → [Rule-Based Safety Lock Check]
                    ↓ triggered?
                YES → Return MANDATORY_SAFETY_LOCK immediately
                NO  → Delegate to WorkerAgent (ML)
                           ↓
                        Return ML-based TriageResponse
    """

    def analyze(
        self,
        text: str,
        pet_species: str = None,
        pet_age_years: float = None,
        pet_weight_kg: float = None,
    ) -> TriageResponse:
        session_id = str(uuid.uuid4())[:8]

        # ── Phase 1: Safety Lock Check (rule-based, O(n) keyword scan) ────────
        triggered_kws, triggered_cats = detect_safety_locks(text)

        if triggered_kws:
            raw_instructions = get_safety_instructions(triggered_cats)
            safety_instructions = [
                SafetyInstruction(
                    code=i["code"],
                    message=i["message"],
                    priority=i["priority"],
                )
                for i in raw_instructions
            ]
            return TriageResponse(
                status=SeverityLevel.MANDATORY_SAFETY_LOCK,
                severity_label=SEVERITY_LABELS[SeverityLevel.MANDATORY_SAFETY_LOCK],
                triggered_by="supervisor_rule",
                triggered_keywords=triggered_kws,
                safety_instructions=safety_instructions,
                worker_analysis=None,
                next_action=NEXT_ACTIONS[SeverityLevel.MANDATORY_SAFETY_LOCK],
                ui_override=True,
                session_id=session_id,
            )

        # ── Phase 2: Worker Agent (ML model) ──────────────────────────────────
        worker_result: WorkerAnalysis = _worker.analyze(
            text=text,
            pet_species=pet_species,
            pet_age_years=pet_age_years,
            pet_weight_kg=pet_weight_kg,
        )

        ml_severity = worker_result.ml_predicted_severity
        raw_instructions = get_safety_instructions(
            [cat for cat in triggered_cats] if triggered_cats else []
        )
        # For non-lock responses, provide general instructions based on ML severity
        if not raw_instructions:
            raw_instructions = _get_general_instructions(ml_severity)

        safety_instructions = [
            SafetyInstruction(code=i["code"], message=i["message"], priority=i["priority"])
            for i in raw_instructions
        ]

        return TriageResponse(
            status=ml_severity,
            severity_label=SEVERITY_LABELS.get(ml_severity, str(ml_severity)),
            triggered_by="ml_model",
            triggered_keywords=[],
            safety_instructions=safety_instructions,
            worker_analysis=worker_result,
            next_action=NEXT_ACTIONS.get(ml_severity, "CONSULT_VET"),
            ui_override=(ml_severity in [SeverityLevel.CRITICAL, SeverityLevel.MANDATORY_SAFETY_LOCK]),
            session_id=session_id,
        )


def _get_general_instructions(severity: SeverityLevel):
    """Fallback instructions for ML-classified non-lock cases."""
    base = [
        {"code": "MONITOR_PET", "message": "Monitor your pet's condition closely.", "priority": 2},
        {"code": "CONTACT_VET", "message": "Contact your vet at the appropriate urgency level.", "priority": 1},
    ]
    if severity == SeverityLevel.CRITICAL:
        return [
            {"code": "GO_EMERGENCY_NOW", "message": "Go to an emergency vet immediately.", "priority": 1},
            {"code": "DO_NOT_WAIT", "message": "Do not wait for condition to improve on its own.", "priority": 1},
        ]
    elif severity == SeverityLevel.URGENT:
        return [
            {"code": "CALL_VET_TODAY", "message": "Call your vet today — do not wait until tomorrow.", "priority": 1},
            {"code": "RESTRICT_ACTIVITY", "message": "Keep your pet calm and restrict exercise.", "priority": 2},
        ]
    return base
