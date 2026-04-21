"""
FastAPI Triage Agent — PetSentinel Backend
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from models.schemas import SymptomInput, TriageResponse
from agents.supervisor import SupervisorAgent
from ml.predictor import get_model_info
from routers import senior as senior_router
from routers import legal as legal_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("petsentinel")

_supervisor: SupervisorAgent | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialise the supervisor and warm up the ML model."""
    global _supervisor
    logger.info("⚡ PetSentinel API starting up...")
    try:
        _supervisor = SupervisorAgent()
        info = get_model_info()
        logger.info(
            f"✅ ML model ready | classes={info['classes']} | "
            f"CV F1={info['cv_f1_weighted']:.4f}"
        )
    except FileNotFoundError:
        logger.warning(
            "⚠️  ML model not found — run 'python -m ml.train_model' first. "
            "Supervisor rule-based locks will still work."
        )
    yield
    logger.info("🛑 PetSentinel API shutting down.")


app = FastAPI(
    title="PetSentinel Triage Agent",
    description=(
        "Supervisor/Worker AI triage pipeline for pet health emergencies. "
        "Detects MANDATORY_SAFETY_LOCK conditions and provides "
        "ML-backed severity assessment and safety instruction sets."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=__import__("os").getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(senior_router.router)
app.include_router(legal_router.router)

# ── Routes ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["health"])
async def root():
    return {"service": "PetSentinel Triage Agent", "status": "operational"}


@app.get("/health", tags=["health"])
async def health():
    try:
        ml_info = get_model_info()
    except FileNotFoundError:
        ml_info = {"model_ready": False}
    return {"status": "ok", "ml": ml_info}


@app.post(
    "/analyze-symptoms",
    response_model=TriageResponse,
    summary="Triage pet symptoms",
    description=(
        "Submit a free-text symptom description. "
        "The Supervisor Agent checks for MANDATORY_SAFETY_LOCK triggers first. "
        "If triggered, a Safety Instruction Set is returned immediately and "
        "`ui_override=true` signals the Next.js frontend to display the "
        "EmergencyTriage screen. Otherwise, the Worker Agent runs the ML "
        "model for severity classification."
    ),
    tags=["triage"],
)
async def analyze_symptoms(payload: SymptomInput) -> TriageResponse:
    if _supervisor is None:
        raise HTTPException(
            status_code=503,
            detail="Supervisor agent not initialized. Check server logs.",
        )
    try:
        result = _supervisor.analyze(
            text=payload.input,
            pet_species=payload.pet_species,
            pet_age_years=payload.pet_age_years,
            pet_weight_kg=payload.pet_weight_kg,
            health_context=payload.health_context
        )
        logger.info(
            f"[{result.session_id}] '{payload.input[:60]}...' "
            f"→ {result.status} | triggered_by={result.triggered_by} "
            f"| ui_override={result.ui_override}"
        )
        return result
    except Exception as e:
        logger.error(f"Triage error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})
