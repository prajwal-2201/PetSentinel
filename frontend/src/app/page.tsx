"use client";

import { useState, useCallback } from "react";
import PetTransition from "@/components/PetTransition";
import EmergencyTriage from "@/components/EmergencyTriage";
import SilverPawsMode from "@/components/SilverPawsMode";
import { analyzeSymptoms, assessSeniorRisk, type TriageResponse, type SeniorRiskResponse } from "@/lib/triageApi";

// ── Mode types ────────────────────────────────────────────────────────────────
type AppMode = "guardian" | "care" | "silver_paws";

// ── Critical Override Banner ───────────────────────────────────────────────────
function CriticalBanner({
  triage,
  onDismiss,
}: {
  triage: TriageResponse;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-error/10 backdrop-blur-sm">
      {/* Overlay — full-screen emergency override */}
      <div className="bg-error-container text-on-error-container flex-1 flex flex-col overflow-y-auto">
        {/* Alert bar */}
        <div className="bg-error px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-error animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              crisis_alert
            </span>
            <span className="font-headline font-bold text-on-error uppercase tracking-widest text-sm">
              CRITICAL ALERT — UI OVERRIDE ACTIVE
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-on-error/70 hover:text-on-error text-xs font-label flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            Dismiss
          </button>
        </div>

        {/* Emergency content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 space-y-6 max-w-lg mx-auto w-full text-center">
          <div className="w-24 h-24 bg-on-error-container rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <span className="material-symbols-outlined text-6xl text-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>

          <div>
            <p className="text-xs font-label uppercase tracking-widest text-on-error-container/60 mb-1">
              Session ID: {triage.session_id}
            </p>
            <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tighter text-on-error-container leading-tight mb-3">
              {triage.status.replace("_", " ")}
            </h1>
            <p className="font-body text-on-error-container/80">
              {triage.severity_label}
            </p>
          </div>

          {/* Triggered keywords */}
          {triage.triggered_keywords.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {triage.triggered_keywords.map((kw) => (
                <span
                  key={kw}
                  className="bg-on-error-container/20 text-on-error-container text-xs font-label px-3 py-1 rounded-full border border-on-error-container/20"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Safety instructions */}
          <div className="w-full bg-on-error-container/10 rounded-2xl p-5 text-left space-y-3 border border-on-error-container/20">
            <h2 className="font-headline font-bold text-lg uppercase tracking-wide flex items-center gap-2 text-on-error-container">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
              Safety Instruction Set
            </h2>
            <ul className="space-y-2">
              {triage.safety_instructions.map((instr) => (
                <li key={instr.code} className="flex items-start gap-3 text-sm font-body">
                  <span className="flex-shrink-0 w-6 h-6 bg-on-error-container text-error-container rounded flex items-center justify-center text-xs font-black mt-0.5">
                    {instr.priority}
                  </span>
                  <span className="text-on-error-container font-medium">{instr.message}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 w-full">
            <a
              href="tel:+918022221188"
              className="w-full min-h-[60px] bg-on-error-container text-error-container font-headline font-bold text-lg rounded-xl uppercase tracking-wide flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              Call Emergency Vet — BBMP 24/7
            </a>
            <p className="text-xs font-label text-on-error-container/60">
              Next action: <strong>{triage.next_action.replace(/_/g, " ")}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Triage Input Bar ───────────────────────────────────────────────────────────
function TriageBar({
  onResult,
  onSilverPaws,
}: {
  onResult: (r: TriageResponse) => void;
  onSilverPaws: (r: SeniorRiskResponse) => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTriage = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Simultaneously run senior risk for 17yr old demo + triage
      const [triageRes] = await Promise.all([
        analyzeSymptoms(input),
      ]);
      onResult(triageRes);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backend not reachable — run: uvicorn main:app --reload in /backend");
    } finally {
      setLoading(false);
    }
  }, [input, onResult]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
      {error && (
        <div className="mb-2 bg-error-container/90 text-on-error-container text-xs font-label px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
      <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-outline-variant/20 flex items-center gap-2 px-4 py-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTriage()}
          placeholder="Describe symptoms to triage..."
          className="flex-1 bg-transparent text-on-surface font-body text-sm py-2 focus:outline-none placeholder:text-on-surface-variant"
        />
        <button
          onClick={handleTriage}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 bg-tertiary-dim text-on-tertiary px-4 py-2 rounded-xl font-label text-sm flex items-center gap-1 disabled:opacity-40 hover:bg-tertiary transition-colors active:scale-95"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">send</span>
          )}
          Triage
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [mode, setMode] = useState<AppMode>("guardian");
  const [criticalTriage, setCriticalTriage] = useState<TriageResponse | null>(null);
  const [silverPawsData, setSilverPawsData] = useState<SeniorRiskResponse | null>(null);

  // Critical override: triggered by MANDATORY_SAFETY_LOCK or CRITICAL from backend
  const handleTriageResult = useCallback((result: TriageResponse) => {
    if (result.ui_override || result.status === "CRITICAL" || result.status === "MANDATORY_SAFETY_LOCK") {
      setCriticalTriage(result);
    }
  }, []);

  const handleSilverPaws = useCallback((result: SeniorRiskResponse) => {
    if (result.silver_paws_mode) {
      setSilverPawsData(result);
      setMode("silver_paws");
    }
  }, []);

  const dismissCritical = useCallback(() => setCriticalTriage(null), []);

  // Demo: trigger silver paws for a 17yr old dog
  async function demoSilverPaws() {
    try {
      const result = await assessSeniorRisk({
        pet_name: "Max",
        species: "dog",
        age_years: 17,
        weight_kg: 28,
        ideal_weight_kg: 32,
        mobility_score: 6,
        known_conditions: [
          { name: "Osteoarthritis", severity: "severe" },
          { name: "Chronic Kidney Disease Stage 2", severity: "moderate" },
        ],
        recent_symptoms: "lethargic and reluctant to move, sleeping most of the day",
        daily_steps: 400,
        avg_rest_hours: 20,
        pain_vocalization: true,
        weight_change_kg_per_month: -0.4,
      });
      handleSilverPaws(result);
    } catch {
      // Backend not running — show silver paws with mock data
      setSilverPawsData({
        pet_name: "Max",
        species: "dog",
        age_years: 17,
        risk_score: 0.89,
        risk_tier: "GERIATRIC_CRITICAL",
        silver_paws_mode: true,
        ui_state: "silver_paws",
        risk_factors: [
          { name: "Age Risk", raw_value: 17, normalized_score: 0.84, weight: 0.40, contribution: 0.34, interpretation: "GERIATRIC — 17yr is significantly advanced." },
          { name: "Mobility Risk", raw_value: 6, normalized_score: 0.72, weight: 0.35, contribution: 0.25, interpretation: "SEVERE MOBILITY DECLINE — cannot navigate independently." },
          { name: "Condition Risk", raw_value: 2, normalized_score: 0.60, weight: 0.12, contribution: 0.07, interpretation: "Active conditions: Osteoarthritis, Chronic Kidney Disease." },
          { name: "BMI/Weight Risk", raw_value: 28, normalized_score: 0.13, weight: 0.08, contribution: 0.01, interpretation: "MODERATE: 12.5% underweight." },
          { name: "Symptom Risk", raw_value: 0, normalized_score: 0.50, weight: 0.05, contribution: 0.03, interpretation: "Lethargic and reluctant to move." },
        ],
        recommendations: [
          { specialist_type: "Palliative Care Coordinator", action: "Initiate home-based palliative care plan", urgency: "urgent", description: "Comprehensive end-of-life support: pain scoring protocols, nutritional support, pressure sore prevention, and quality-of-life assessment.", contact_type: "home_visit" },
          { specialist_type: "Veterinary Geriatrician", action: "Schedule home visit for comprehensive geriatric assessment", urgency: "soon", description: "A veterinary geriatrician will assess cognitive function, pain levels, organ reserves, and quality of life.", contact_type: "home_visit" },
        ],
        mobility_insight: "Risk Score R = 0.890. Geriatric amplifier applied (x1.25). SEVERE MOBILITY DECLINE. Daily step count: 400 (target: 2,000–3,000). Weight loss of 0.40kg/month detected — sarcopenia risk.",
        palliative_triggered: true,
        next_assessment_days: 3,
      });
      setMode("silver_paws");
    }
  }

  return (
    <>
      {/* CRITICAL OVERRIDE — renders over everything */}
      {criticalTriage && (
        <CriticalBanner triage={criticalTriage} onDismiss={dismissCritical} />
      )}

      <div className="min-h-screen bg-surface flex flex-col font-body relative pb-24">
        {/* Main view */}
        <div className="flex-1 w-full">
          {mode === "guardian"     && <PetTransition />}
          {mode === "care"         && <EmergencyTriage />}
          {mode === "silver_paws"  && silverPawsData && (
            <SilverPawsMode data={silverPawsData} onDismiss={() => setMode("guardian")} />
          )}
        </div>

        {/* Floating triage input */}
        <TriageBar onResult={handleTriageResult} onSilverPaws={handleSilverPaws} />

        {/* Floating Mode Toggle Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-2 rounded-full shadow-[0px_10px_30px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-50 flex gap-1">
          <button
            id="mode-guardian"
            onClick={() => setMode("guardian")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase tracking-wider ${
              mode === "guardian"
                ? "bg-secondary-container text-secondary-dim shadow-sm"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shield_person</span>
            Guardian
          </button>
          <button
            id="mode-care"
            onClick={() => setMode("care")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase tracking-wider ${
              mode === "care"
                ? "bg-tertiary-container text-tertiary-dim shadow-sm"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">medical_services</span>
            Care
          </button>
          <button
            id="mode-silver-paws"
            onClick={demoSilverPaws}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase tracking-wider ${
              mode === "silver_paws"
                ? "bg-primary-container/30 text-primary shadow-sm"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">elderly</span>
            Silver Paws
          </button>
        </div>
      </div>
    </>
  );
}
