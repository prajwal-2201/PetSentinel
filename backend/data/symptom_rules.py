"""
Safety Instruction Sets and Keyword Rules for the Supervisor Agent.
Each rule maps a set of trigger phrases to a structured Safety Instruction Set.
"""
from typing import Dict, List, Tuple

# ---------------------------------------------------------------------------
# MANDATORY_SAFETY_LOCK trigger keywords (any match → immediate lock)
# Organized by body system for explainability
# ---------------------------------------------------------------------------
SAFETY_LOCK_RULES: Dict[str, List[str]] = {
    "nervous_system": [
        "nervous system", "neurological", "seizure", "convulsing", "convulsion",
        "trembling uncontrollably", "twitching", "collapse", "collapsed",
        "can't stand", "cannot stand", "falling over", "loss of balance",
        "head tilt", "circling", "disoriented", "unresponsive", "unconscious",
        "coma", "paralysis", "paralyzed", "dragging legs",
    ],
    "respiratory": [
        "not breathing", "gasping", "choking", "blue gums", "blue tongue",
        "purple tongue", "cyanosis", "difficulty breathing", "laboured breathing",
        "aspiration", "suffocating",
    ],
    "toxin_ingestion": [
        "ate poison", "swallowed poison", "ingested medication", "ate chocolate",
        "ate xylitol", "ate grapes", "ate raisins", "ate onion", "ate garlic",
        "swallowed a bone", "ate rat poison", "ate human medication",
        "poisoning", "toxicity", "toxic",
    ],
    "critical_vitals": [
        "tongue out", "tongue hanging out", "heart stopped", "no pulse",
        "lethargy", "lethargic", "extreme lethargy", "won't wake up",
        "won't respond", "pale gums", "white gums", "yellow gums", "jaundice",
        "bloated stomach", "distended abdomen", "abdomen distended",
        "unable to urinate", "hasn't urinated", "blocked", "urinary blockage",
    ],
    "trauma": [
        "hit by car", "fell from height", "broken bone", "fracture",
        "heavy bleeding", "bleeding profusely", "deep wound", "eye injury",
        "eyeball out", "prolapsed eye",
    ],
}

# Flatten for O(1) lookup — store (keyword, category) pairs
_FLAT_RULES: List[Tuple[str, str]] = [
    (kw.lower(), category)
    for category, keywords in SAFETY_LOCK_RULES.items()
    for kw in keywords
]


def detect_safety_locks(text: str) -> Tuple[List[str], List[str]]:
    """
    Returns (triggered_keywords, triggered_categories) from the input text.
    """
    text_lower = text.lower()
    matched_kws: List[str] = []
    matched_cats: List[str] = []
    for kw, cat in _FLAT_RULES:
        if kw in text_lower:
            matched_kws.append(kw)
            if cat not in matched_cats:
                matched_cats.append(cat)
    return matched_kws, matched_cats


# ---------------------------------------------------------------------------
# Safety Instruction Sets by triggered category
# Each instruction has a code, human message, and priority (1=highest)
# ---------------------------------------------------------------------------
SAFETY_INSTRUCTION_SETS: Dict[str, List[Dict]] = {
    "nervous_system": [
        {"code": "DO_NOT_FORCE_FEED",    "message": "DO NOT force feed food or water — swallow reflex may be impaired.", "priority": 1},
        {"code": "DO_NOT_MOVE_NECK",     "message": "DO NOT bend or manipulate the neck — spinal injury protocol.", "priority": 1},
        {"code": "KEEP_CALM_DARK",       "message": "Place pet in a quiet, dark, confined space to reduce stimulation.", "priority": 2},
        {"code": "CONTACT_VET_NOW",      "message": "Contact emergency veterinarian IMMEDIATELY — neurological emergencies are time-critical.", "priority": 1},
        {"code": "RECORD_SEIZURE",       "message": "If seizing: time the episode, do not restrain, protect from injury. Record video if safe.", "priority": 2},
    ],
    "respiratory": [
        {"code": "DO_NOT_SYRINGE_WATER", "message": "DO NOT syringe fluids — will worsen aspiration.", "priority": 1},
        {"code": "DO_NOT_FORCE_FEED",    "message": "DO NOT attempt feeding of any kind.", "priority": 1},
        {"code": "CLEAR_AIRWAY",         "message": "Gently extend neck to open airway. Do NOT perform compressions without vet guidance.", "priority": 1},
        {"code": "CONTACT_VET_NOW",      "message": "Respiratory distress is immediately life-threatening. Go to emergency vet.", "priority": 1},
        {"code": "KEEP_UPRIGHT",         "message": "Keep pet in sternal (sitting up) position to aid breathing. Do not lay flat.", "priority": 2},
    ],
    "toxin_ingestion": [
        {"code": "DO_NOT_INDUCE_VOMIT",  "message": "DO NOT induce vomiting unless explicitly instructed by a vet — may cause further damage.", "priority": 1},
        {"code": "IDENTIFY_SUBSTANCE",   "message": "Identify the exact substance and quantity ingested. Bring the packaging to the vet.", "priority": 1},
        {"code": "CALL_POISON_CONTROL",  "message": "Call animal poison control (ASPCA: +1-888-426-4435) and emergency vet in parallel.", "priority": 1},
        {"code": "NO_HOME_REMEDY",       "message": "DO NOT attempt home remedies — milk, oil, or water will not neutralise toxins.", "priority": 2},
    ],
    "critical_vitals": [
        {"code": "DO_NOT_FORCE_FEED",    "message": "DO NOT force feed food or water.", "priority": 1},
        {"code": "CHECK_PULSE",          "message": "Check femoral pulse (inner thigh). If absent, alert vet immediately.", "priority": 1},
        {"code": "KEEP_WARM",            "message": "Wrap in a warm blanket — shock causes rapid heat loss.", "priority": 2},
        {"code": "CONTACT_VET_NOW",      "message": "Transport to emergency vet. Do not wait to see if condition improves.", "priority": 1},
    ],
    "trauma": [
        {"code": "DO_NOT_MOVE_SPINE",    "message": "DO NOT lift or move unless breathing is immediately threatened — may worsen spinal injury.", "priority": 1},
        {"code": "APPLY_PRESSURE",       "message": "Apply firm, steady pressure to any actively bleeding wound with a clean cloth.", "priority": 1},
        {"code": "MUZZLE_SAFELY",        "message": "Even gentle pets may bite when in pain. Muzzle safely if transporting.", "priority": 2},
        {"code": "CONTACT_VET_NOW",      "message": "Trauma requires immediate veterinary imaging and assessment.", "priority": 1},
    ],
    "default": [
        {"code": "DO_NOT_FORCE_FEED",    "message": "DO NOT force feed food or water until assessed by a vet.", "priority": 1},
        {"code": "MONITOR_CLOSELY",      "message": "Monitor breathing rate, gum colour, and responsiveness every 5 minutes.", "priority": 2},
        {"code": "CONTACT_VET_NOW",      "message": "Contact your veterinarian immediately.", "priority": 1},
    ],
}


def get_safety_instructions(categories: List[str]) -> List[Dict]:
    """
    Aggregates and deduplicates safety instructions for all triggered categories.
    Returns list sorted by priority ascending (1 = highest).
    """
    seen_codes = set()
    instructions = []
    target_cats = categories if categories else ["default"]
    for cat in target_cats:
        for instr in SAFETY_INSTRUCTION_SETS.get(cat, SAFETY_INSTRUCTION_SETS["default"]):
            if instr["code"] not in seen_codes:
                seen_codes.add(instr["code"])
                instructions.append(instr)
    return sorted(instructions, key=lambda x: x["priority"])
