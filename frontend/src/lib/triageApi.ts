/**
 * triageApi.ts — Typed client for all PetSentinel backend endpoints.
 * Uses fetch with AbortController for timeout support.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ── Shared ────────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("Request timed out. Server might be down or busy.");
    if (err.message === "Failed to fetch") throw new Error("Failed to connect to triage server. Ensure backend is running and CORS allows the request.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function get<T>(path: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("Request timed out. Server might be down or busy.");
    if (err.message === "Failed to fetch") throw new Error("Failed to connect to server. Ensure backend is running and CORS allows the request.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── /analyze-symptoms ────────────────────────────────────────────────────────

export enum SeverityLevel {
  SAFE = "SAFE",
  MONITOR = "MONITOR",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL",
  MANDATORY_SAFETY_LOCK = "MANDATORY_SAFETY_LOCK",
}

export type SafetyInstruction = { code: string; message: string; priority: number };
export type WorkerAnalysis = {
  symptoms_detected: string[];
  body_systems_affected: string[];
  risk_score: number;
  ml_predicted_severity: SeverityLevel;
  ml_confidence: number;
  recommended_actions: string[];
};
export type TriageResponse = {
  status: SeverityLevel;
  severity_label: string;
  triggered_by: "supervisor_rule" | "ml_model";
  triggered_keywords: string[];
  safety_instructions: SafetyInstruction[];
  worker_analysis: WorkerAnalysis | null;
  next_action: string;
  ui_override: boolean;
  session_id: string;
};

export async function analyzeSymptoms(
  input: string,
  options?: { 
    pet_species?: string; 
    pet_age_years?: number; 
    pet_weight_kg?: number;
    health_context?: string;
  }
): Promise<TriageResponse> {
  return post<TriageResponse>("/analyze-symptoms", { input, ...options });
}

// ── /senior-risk ──────────────────────────────────────────────────────────────

export type KnownCondition = { name: string; severity: string; diagnosed_years_ago?: number };
export type SeniorRiskInput = {
  pet_name: string;
  species: string;
  age_years: number;
  weight_kg: number;
  ideal_weight_kg?: number;
  mobility_score: number;        // 0 (fully mobile) – 10 (immobile)
  known_conditions?: KnownCondition[];
  recent_symptoms?: string;
  daily_steps?: number;
  avg_rest_hours?: number;
  pain_vocalization?: boolean;
  weight_change_kg_per_month?: number;
};
export type RiskFactor = {
  name: string;
  raw_value: number;
  normalized_score: number;
  weight: number;
  contribution: number;
  interpretation: string;
};
export type SilverPawsRecommendation = {
  specialist_type: string;
  action: string;
  urgency: string;
  description: string;
  contact_type: string;
};
export type SeniorRiskResponse = {
  pet_name: string;
  species: string;
  age_years: number;
  risk_score: number;
  risk_tier: string;
  silver_paws_mode: boolean;
  ui_state: "silver_paws" | "senior_monitor" | "routine";
  risk_factors: RiskFactor[];
  recommendations: SilverPawsRecommendation[];
  mobility_insight: string;
  palliative_triggered: boolean;
  next_assessment_days: number;
};

export async function assessSeniorRisk(input: SeniorRiskInput): Promise<SeniorRiskResponse> {
  return post<SeniorRiskResponse>("/senior-risk", input);
}

// ── /legal-shield ─────────────────────────────────────────────────────────────

export type AwbiGuideline = {
  id: string;
  title: string;
  date: string;
  authority: string;
  jurisdiction: string;
  summary: string;
  full_text_url: string;
  actionable: string;
  legal_sections: string[];
};
export type LegalShieldResponse = {
  jurisdiction: string;
  total_guidelines: number;
  guidelines: AwbiGuideline[];
  summary: string;
  emergency_contact: { name: string; phone: string; hours: string };
};

export async function getLegalShield(category?: string, jurisdiction?: string, neighborhood?: string): Promise<LegalShieldResponse> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (jurisdiction) params.append("jurisdiction", jurisdiction);
  if (neighborhood) params.append("neighborhood", neighborhood);
  
  const qs = params.toString() ? `?${params.toString()}` : "";
  return get<LegalShieldResponse>(`/legal-shield${qs}`);
}

export type LegalNoticeRequest = {
  owner_name: string;
  owner_address: string;
  owner_contact: string;
  rwa_name: string;
  rwa_address: string;
  pin_code: string;
  pet_name: string;
  species: string;
  pet_age: string;
  bbmp_reg?: string;
};
export type LegalNoticeResponse = {
  notice_text: string;
  guidelines_cited: string[];
  next_steps: string[];
};

export async function generateLegalNotice(req: LegalNoticeRequest): Promise<LegalNoticeResponse> {
  return post<LegalNoticeResponse>("/legal-shield/generate-notice", req);
}
