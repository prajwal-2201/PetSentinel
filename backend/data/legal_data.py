"""
AWBI (Animal Welfare Board of India) guidelines and legal data
for Bangalore (BBMP/Karnataka) RWA pet rights enforcement.
"""
from typing import Dict, List, Any

# ── Species Maximum Lifespans (for age normalization) ─────────────────────────
SPECIES_MAX_AGE: Dict[str, float] = {
    "dog": 20.0,
    "cat": 25.0,
    "rabbit": 12.0,
    "bird": 30.0,
    "hamster": 3.0,
    "guinea_pig": 8.0,
    "other": 15.0,
}

# Species senior threshold (age at which "senior" care begins)
SPECIES_SENIOR_AGE: Dict[str, float] = {
    "dog": 7.0,
    "cat": 10.0,
    "rabbit": 5.0,
    "bird": 10.0,
    "other": 8.0,
}

# ── Palliative / Senior-Care Specialist Types ─────────────────────────────────
PALLIATIVE_SPECIALISTS = {
    "geriatric_vet": {
        "specialist_type": "Veterinary Geriatrician",
        "action": "Schedule home visit for comprehensive geriatric assessment",
        "urgency": "soon",
        "description": (
            "A veterinary geriatrician will assess cognitive function, pain levels, "
            "organ reserves, and quality of life. Recommends a tailored palliative protocol "
            "including pain management, physiotherapy, and appetite support."
        ),
        "contact_type": "home_visit",
    },
    "pain_management": {
        "specialist_type": "Veterinary Pain Management Specialist",
        "action": "Initiate multimodal pain management protocol",
        "urgency": "urgent",
        "description": (
            "Multimodal analgesia (NSAIDs + gabapentin + acupuncture) specifically for "
            "senior dogs with mobility impairment. Home-visit capable in Bangalore metro."
        ),
        "contact_type": "home_visit",
    },
    "physio": {
        "specialist_type": "Canine Physiotherapist",
        "action": "Begin hydrotherapy and passive mobility exercises",
        "urgency": "routine",
        "description": (
            "Underwater treadmill therapy and gentle range-of-motion exercises "
            "significantly improve quality of life in geriatric dogs. "
            "Multiple Bangalore clinics offer mobile physiotherapy."
        ),
        "contact_type": "clinic",
    },
    "palliative_home": {
        "specialist_type": "Palliative Care Coordinator",
        "action": "Initiate home-based palliative care plan",
        "urgency": "urgent",
        "description": (
            "Comprehensive end-of-life support: pain scoring protocols (GCMPS), "
            "nutritional support for cachexia, pressure sore prevention, "
            "and quality-of-life assessment. Home visits available across Bangalore."
        ),
        "contact_type": "home_visit",
    },
    "hospice": {
        "specialist_type": "Veterinary Hospice Specialist",
        "action": "Initiate hospice protocol and quality-of-life monitoring",
        "urgency": "urgent",
        "description": (
            "For pets approaching end-of-life, hospice care focuses on comfort, "
            "dignity, and family support. Includes regular home assessments, "
            "24/7 telehealth support, and compassionate guidance."
        ),
        "contact_type": "home_visit",
    },
}

# ── Regional Legal Metadata ──────────────────────────────────────────────────
REGIONAL_DATA = {
    "bangalore": {
        "jurisdiction": "Bangalore / BBMP / Karnataka",
        "emergency_contact": {
            "name": "BBMP Animal Care Cell",
            "phone": "+91 80-22221188",
            "hours": "24/7 Emergency",
        },
        "summary": (
            "Under Indian law, RWAs cannot ban pet ownership. The AWBI circular (2015), "
            "PCA Act 1960, BBMP circular (2022), and Karnataka HC judgment (2019) collectively "
            "guarantee your right to keep a registered pet in any residential unit in Bangalore."
        ),
    },
    "generic_india": {
        "jurisdiction": "India (All States)",
        "emergency_contact": {
            "name": "Local Animal Welfare Board",
            "phone": "Dial 100 or 1962",
            "hours": "Variable",
        },
        "summary": (
            "The Prevention of Cruelty to Animals Act (1960) and AWBI guidelines "
            "apply across all Indian states. Personal pet ownership is protected under "
            "the right to property and life."
        ),
    }
}

# ── Neighborhood-Specific Overrides ───────────────────────────────────────────
NEIGHBORHOOD_OVERRIDES = {
    "indiranagar": [
        {
            "id": "INDIRANAGAR_RWA_NOTICE",
            "title": "Indiranagar 1st Stage RWA — High Court Compliance",
            "date": "2024-01-10",
            "authority": "Local Neighborhood Association",
            "jurisdiction": "Indiranagar, Bangalore",
            "summary": "Specific neighborhood guidelines ensuring leash compliance and usage of common side-gates.",
            "full_text_url": "#",
            "actionable": "Cite this when discussing morning walk routes with RWA security.",
            "legal_sections": ["Neighborhood Bylaw 4.2"],
        }
    ]
}

AWBI_GUIDELINES: List[Dict[str, Any]] = [
    {
        "id": "AWBI_CIRCULAR_2015",
        "title": "AWBI Circular — RWAs Cannot Ban Pets",
        "date": "2015-07-15",
        "authority": "Animal Welfare Board of India",
        "jurisdiction": "All India",
        "summary": "RWAs and societies cannot prohibit residents from keeping pet animals.",
        "full_text_url": "https://awbi.in/awbi-pdf/order_pets_in_apartments.pdf",
        "actionable": "Primary defence against a ban notice. Present to Secretary.",
        "legal_sections": ["Section 11, PCA 1960", "Article 21, Constitution"],
    },
    {
        "id": "PCA_1960",
        "title": "Prevention of Cruelty to Animals Act, 1960",
        "date": "1960-12-26",
        "authority": "Parliament of India",
        "jurisdiction": "All India",
        "summary": "Foundational legislation defining acts of cruelty as criminal offences.",
        "full_text_url": "https://awbi.in/awbi-pdf/pcaact_1960.pdf",
        "actionable": "File FIR if anyone prevents veterinary access or causes harm.",
        "legal_sections": ["Section 11", "Section 38"],
    },
    {
        "id": "BBMP_PETS_2022",
        "title": "BBMP Circular — Apartment Pet Guidelines",
        "date": "2022-04-01",
        "authority": "BBMP",
        "jurisdiction": "Bangalore",
        "summary": "Mandates RWA compliance for registered pets in Bangalore.",
        "full_text_url": "https://bbmp.gov.in/documents/pet-registration",
        "actionable": "Register dog at bbmp.gov.in to confirm your legal standing.",
        "legal_sections": ["BBMP Act 2020", "Bangalore Municipal Bylaws"],
    },
]

# ── Legal Notice Template ──────────────────────────────────────────────────────
LEGAL_NOTICE_TEMPLATE = """
LEGAL NOTICE
Under the Prevention of Cruelty to Animals Act, 1960 & AWBI Guidelines

Date: {date}

To: {rwa_name}
    {rwa_address}
    Bangalore – {pin_code}

Through the Secretary / Managing Committee

Subject: Unlawful Restriction on Pet Ownership / Pet Rights Violation

Respected Sir/Madam,

I, {owner_name}, residing at {owner_address}, Bangalore, am the bonafide owner of 
{pet_name}, a {species} aged {pet_age} years, duly registered with BBMP 
(Registration No.: {bbmp_reg}).

It has come to my notice that the association has issued restrictions that violate 
my fundamental rights and applicable animal welfare laws, specifically:

1. AWBI Circular dated 15-07-2015 explicitly prohibits RWAs from banning pets.
2. Prevention of Cruelty to Animals Act 1960, Section 11.
3. Karnataka High Court judgment WP(C) 47823/2019 establishing pet ownership rights.
4. BBMP Circular dated 01-04-2022 mandating RWA compliance for registered pets.

Legal Demand:
Kindly immediately withdraw any notice, verbal instruction, or bye-law that 
restricts my right to keep, commute with, or seek veterinary care for my pet, 
failing which I reserve the right to:

a) File a criminal complaint under Section 11 of the PCA Act 1960.
b) Approach the Karnataka High Court for appropriate relief.
c) File a complaint before the District Animal Welfare Officer, Bangalore.
d) Report the matter to the Animal Welfare Board of India (Chennai).

This notice is sent without prejudice to any other legal remedies available.

Yours faithfully,
{owner_name}
Contact: {owner_contact}
Date: {date}

---
Prepared using PetSentinel Legal Shield | AWBI-compliant template
"""

BANGALORE_VET_EMERGENCY = {
    "name": "BBMP Animal Care Cell",
    "phone": "+91 80-22221188",
    "alt_phone": "+91 1962",
    "hours": "24/7 Emergency",
}
