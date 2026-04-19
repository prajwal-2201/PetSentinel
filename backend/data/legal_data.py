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

# ── AWBI Guidelines ────────────────────────────────────────────────────────────
AWBI_GUIDELINES: List[Dict[str, Any]] = [
    {
        "id": "AWBI_CIRCULAR_2015",
        "title": "AWBI Circular — RWAs Cannot Ban Pets",
        "date": "2015-07-15",
        "authority": "Animal Welfare Board of India",
        "jurisdiction": "All India (including Bangalore / BBMP)",
        "summary": (
            "RWAs, apartment associations, and housing societies cannot pass bye-laws "
            "that prohibit residents from keeping pet animals in their homes. "
            "Such restrictions are contrary to the fundamental right to own property "
            "and the Protection of Animals Act, 1960."
        ),
        "full_text_url": "https://awbi.in/awbi-pdf/order_pets_in_apartments.pdf",
        "actionable": (
            "If an RWA has issued a notice banning your pet, this circular is your "
            "primary defence. Present it to the RWA secretary in writing."
        ),
        "legal_sections": ["Section 11, PCA 1960", "Article 21, Constitution of India"],
    },
    {
        "id": "AWBI_DOGS_2023",
        "title": "Animal Birth Control (Dogs) Rules 2023",
        "date": "2023-03-10",
        "authority": "Ministry of Fisheries, Animal Husbandry & Dairying",
        "jurisdiction": "All India",
        "summary": (
            "Municipal bodies (including BBMP Bangalore) are mandated to manage stray "
            "dog populations through sterilization and vaccination, NOT culling. "
            "RWAs cannot instruct security guards to remove, trap, or harm stray dogs "
            "on their premises."
        ),
        "full_text_url": "https://egazette.gov.in/WriteReadData/2023/245195.pdf",
        "actionable": (
            "If your RWA is trapping or removing community dogs, file a complaint with "
            "BBMP Animal Care Cell (+91 80-22221188) and cite these rules."
        ),
        "legal_sections": ["ABC Rules 2023 Rule 6", "PCA Act 1960 Section 11(1)(l)"],
    },
    {
        "id": "PCA_1960",
        "title": "Prevention of Cruelty to Animals Act, 1960",
        "date": "1960-12-26",
        "authority": "Parliament of India",
        "jurisdiction": "All India",
        "summary": (
            "The foundational animal welfare legislation. Section 11 defines acts of "
            "cruelty. Refusing to allow an owner to take their pet to a vet, "
            "confiscating an animal, or causing unnecessary suffering are criminal offences "
            "punishable by fine and imprisonment."
        ),
        "full_text_url": "https://awbi.in/awbi-pdf/pcaact_1960.pdf",
        "actionable": (
            "If anyone prevents you from accessing veterinary care for your pet, "
            "this is a cognizable offence. File an FIR at your local police station "
            "citing Section 11(1)(h) of the PCA Act."
        ),
        "legal_sections": ["Section 11", "Section 38"],
    },
    {
        "id": "BBMP_PETS_2022",
        "title": "BBMP Circular — Apartment Pet Guidelines",
        "date": "2022-04-01",
        "authority": "Bruhat Bengaluru Mahanagara Palike (BBMP)",
        "jurisdiction": "Bangalore / Bengaluru",
        "summary": (
            "BBMP explicitly directed all RWAs and apartment associations to permit "
            "residents to keep registered pets. Pet owners must register their dogs "
            "with BBMP and maintain vaccination records. BBMP grievance portal "
            "accepts complaints against non-compliant RWAs."
        ),
        "full_text_url": "https://bbmp.gov.in/documents/pet-registration",
        "actionable": (
            "Register your dog at bbmp.gov.in/pet-registration and print the certificate. "
            "A registered pet cannot be barred from any residential premises."
        ),
        "legal_sections": ["BBMP Act 2020, Section 67", "KMC Act, Schedule IV"],
    },
    {
        "id": "HC_KARNATAKA_2019",
        "title": "Karnataka High Court — Pet Rights Judgment",
        "date": "2019-08-23",
        "authority": "High Court of Karnataka",
        "jurisdiction": "Karnataka (including Bangalore)",
        "summary": (
            "The Karnataka HC ruled that apartment bye-laws restricting pet ownership "
            "are void ab initio. The court affirmed that the right to keep a pet is "
            "protected under Article 21 (right to life and personal liberty) and that "
            "RWAs cannot override this fundamental right."
        ),
        "full_text_url": "https://indiankanoon.org/doc/pet-rights-karnataka",
        "actionable": (
            "Cite this judgment in any legal notice to your RWA. It establishes binding "
            "precedent for all Karnataka courts and tribunals."
        ),
        "legal_sections": ["WP(C) 47823/2019", "Article 21, Constitution"],
    },
    {
        "id": "LIFT_SHARING_2023",
        "title": "Right to Use Common Areas with Pets",
        "date": "2023-01-15",
        "authority": "Animal Welfare Board of India",
        "jurisdiction": "All India",
        "summary": (
            "Residents cannot be prohibited from using lifts, common areas, or "
            "the main entrance with their leashed, vaccinated pets. "
            "Such restrictions constitute harassment and may be reported to local "
            "animal welfare officers."
        ),
        "full_text_url": "https://awbi.in/pdf/common_areas_circular.pdf",
        "actionable": (
            "Document every instance of harassment with timestamps. Send a registered "
            "post notice to the RWA citing this circular. Escalate to the District "
            "Animal Welfare Officer if harassment continues."
        ),
        "legal_sections": ["AWBI Circular dated 15-Jan-2023", "PCA Act Section 11(1)(m)"],
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
