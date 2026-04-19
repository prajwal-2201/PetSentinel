"""
/legal-shield endpoint — AWBI guidelines for Bangalore RWAs.
Returns structured legal data and generates a legal notice payload.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from data.legal_data import AWBI_GUIDELINES, LEGAL_NOTICE_TEMPLATE, BANGALORE_VET_EMERGENCY

router = APIRouter(prefix="/legal-shield", tags=["legal"])


class LegalShieldResponse(BaseModel):
    jurisdiction: str
    total_guidelines: int
    guidelines: list
    summary: str
    emergency_contact: dict


class LegalNoticeRequest(BaseModel):
    owner_name: str
    owner_address: str
    owner_contact: str
    rwa_name: str
    rwa_address: str
    pin_code: str
    pet_name: str
    species: str
    pet_age: str
    bbmp_reg: str = "PENDING"


class LegalNoticeResponse(BaseModel):
    notice_text: str
    guidelines_cited: List[str]
    next_steps: List[str]


@router.get("", response_model=LegalShieldResponse, summary="Get AWBI guidelines for Bangalore RWAs")
async def get_legal_shield(
    category: Optional[str] = Query(None, description="Filter by: awbi | bbmp | court | pca"),
    jurisdiction: str = Query("bangalore", description="Target jurisdiction"),
):
    guidelines = AWBI_GUIDELINES

    if category:
        cat_map = {
            "awbi": ["AWBI_"],
            "bbmp": ["BBMP_"],
            "court": ["HC_"],
            "pca": ["PCA_"],
        }
        prefixes = cat_map.get(category.lower(), [])
        if prefixes:
            guidelines = [g for g in guidelines if any(g["id"].startswith(p) for p in prefixes)]

    return LegalShieldResponse(
        jurisdiction="Bangalore / BBMP / Karnataka",
        total_guidelines=len(guidelines),
        guidelines=guidelines,
        summary=(
            "Under Indian law, RWAs cannot ban pet ownership. The AWBI circular (2015), "
            "PCA Act 1960, BBMP circular (2022), and Karnataka HC judgment (2019) collectively "
            "guarantee your right to keep a registered pet in any residential unit in Bangalore. "
            "Violations are cognizable offences — contact BBMP Animal Care Cell immediately."
        ),
        emergency_contact=BANGALORE_VET_EMERGENCY,
    )


@router.post("/generate-notice", response_model=LegalNoticeResponse, summary="Generate a legal notice PDF payload")
async def generate_legal_notice(payload: LegalNoticeRequest):
    notice_text = LEGAL_NOTICE_TEMPLATE.format(
        date=date.today().strftime("%d %B %Y"),
        owner_name=payload.owner_name,
        owner_address=payload.owner_address,
        owner_contact=payload.owner_contact,
        rwa_name=payload.rwa_name,
        rwa_address=payload.rwa_address,
        pin_code=payload.pin_code,
        pet_name=payload.pet_name,
        species=payload.species,
        pet_age=payload.pet_age,
        bbmp_reg=payload.bbmp_reg,
    )

    return LegalNoticeResponse(
        notice_text=notice_text,
        guidelines_cited=[
            "AWBI Circular 15-07-2015",
            "Prevention of Cruelty to Animals Act 1960, Section 11",
            "Karnataka HC Judgment WP(C) 47823/2019",
            "BBMP Circular 01-04-2022",
            "Animal Birth Control (Dogs) Rules 2023",
        ],
        next_steps=[
            "Print this notice on plain paper and sign in blue ink.",
            "Send via Registered Post (RPAD) to the RWA Secretary.",
            "Keep the postal receipt — this is your proof of service.",
            "If no response in 15 days, file a complaint at BBMP Animal Care Cell (+91 80-22221188).",
            "For court filing, consult a local civil/animal rights lawyer with this notice.",
        ],
    )
