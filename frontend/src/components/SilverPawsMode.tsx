"use client";

import type { SeniorRiskResponse, SilverPawsRecommendation } from "@/lib/triageApi";

interface SilverPawsModeProps {
  data?: SeniorRiskResponse;
  onDismiss?: () => void;
}

const URGENCY_COLORS: Record<string, string> = {
  urgent:  "bg-primary text-on-primary",
  soon:    "bg-secondary text-on-secondary",
  routine: "bg-surface-container-high text-on-surface",
};
const URGENCY_ICONS: Record<string, string> = {
  urgent:  "priority_high",
  soon:    "schedule",
  routine: "calendar_month",
};

function RecommendationCard({ rec }: { rec: SilverPawsRecommendation }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-outline-variant/10 flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high">
        <span className="material-symbols-outlined text-secondary-dim text-[20px]">
          {rec.contact_type === "home_visit" ? "home_health" : rec.contact_type === "clinic" ? "local_hospital" : "videocam"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-headline font-bold text-on-surface text-sm leading-tight">{rec.specialist_type}</h4>
          <span className={`flex-shrink-0 text-xs font-label px-2 py-0.5 rounded-full flex items-center gap-1 ${URGENCY_COLORS[rec.urgency] ?? URGENCY_COLORS.routine}`}>
            <span className="material-symbols-outlined text-[12px]">{URGENCY_ICONS[rec.urgency] ?? "info"}</span>
            {rec.urgency}
          </span>
        </div>
        <p className="text-xs font-body text-on-surface-variant leading-relaxed">{rec.description}</p>
        <p className="text-xs font-label text-secondary-dim mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">arrow_right</span>
          {rec.action}
        </p>
      </div>
    </div>
  );
}

function RiskGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const sweepDeg = Math.round(score * 180);

  // Gauge color: green → amber → red
  const color = score >= 0.75 ? "#a63300" : score >= 0.50 ? "#d46800" : "#006a35";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Background arc */}
        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#ffe2df" strokeWidth="14" strokeLinecap="round" />
        {/* Value arc */}
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(sweepDeg / 180) * 220} 220`}
        />
        {/* Score text */}
        <text x="80" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fontFamily="Plus Jakarta Sans" fill={color}>
          {pct}
        </text>
        <text x="80" y="86" textAnchor="middle" fontSize="10" fontFamily="Be Vietnam Pro" fill="#834c48">
          Risk Score
        </text>
      </svg>
      <p className="text-xs font-label text-on-surface-variant">
        {score >= 0.90 ? "GERIATRIC CRITICAL" : score >= 0.75 ? "HIGH — Silver Paws Active" : score >= 0.50 ? "MODERATE" : "LOW"}
      </p>
    </div>
  );
}

export default function SilverPawsMode({ data, onDismiss }: SilverPawsModeProps) {
  if (!data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-12 text-center gap-6">
        <div className="w-14 h-14 border-4 border-secondary-container border-t-secondary rounded-full animate-spin" />
        <div className="space-y-1">
          <p className="font-headline font-bold text-on-surface">Initializing Silver Paws Monitor</p>
          <p className="text-sm font-body text-on-surface-variant">Calibrating geriatric risk factors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-container-low border-b border-outline-variant/20 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            elderly
          </span>
          <span className="font-headline font-bold text-on-surface tracking-tight">Silver Paws Mode</span>
          <span className="bg-secondary-container text-secondary-dim text-xs font-label px-2 py-0.5 rounded-full">
            ACTIVE
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 text-sm font-label"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Exit
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-10 pb-16 space-y-12">
        {/* Hero */}
        <section className="bg-gradient-to-br from-surface-container-low to-surface-container p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-container/30 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-secondary-dim" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface leading-tight">
                  {data.pet_name}
                </h1>
              </div>
              <p className="text-on-surface-variant font-body mb-1 capitalize">
                {data.species} · {data.age_years} years old · {data.risk_tier.replace("_", " ")}
              </p>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed mt-4 max-w-md">
                {data.mobility_insight}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="material-symbols-outlined text-[16px] text-secondary-dim">calendar_today</span>
                <span className="text-sm font-label text-on-surface-variant">
                  Reassess in <strong>{data.next_assessment_days} days</strong>
                </span>
              </div>
            </div>
            <RiskGauge score={data.risk_score} />
          </div>
        </section>

        {/* Risk Factor Breakdown */}
        <section>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-dim">analytics</span>
            Risk Factor Analysis
          </h2>
          <div className="space-y-3">
            {data.risk_factors.map((f) => (
              <div key={f.name} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-sm text-on-surface">{f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-body text-on-surface-variant">
                      weight {(f.weight * 100).toFixed(0)}%
                    </span>
                    <span className="font-headline font-bold text-on-surface">
                      {(f.normalized_score * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${f.normalized_score * 100}%`,
                      backgroundColor: f.normalized_score >= 0.75 ? "#a63300" : f.normalized_score >= 0.50 ? "#d46800" : "#006a35",
                    }}
                  />
                </div>
                <p className="text-xs font-body text-on-surface-variant">{f.interpretation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        {data.palliative_triggered && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  medical_services
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Palliative Care — Home Visit Required</h2>
                <p className="text-sm font-body text-on-surface-variant">Based on R = {data.risk_score.toFixed(3)} — Silver Paws threshold exceeded</p>
              </div>
            </div>
            <div className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          </section>
        )}

        {/* Palliative Alert banner */}
        <div className="bg-gradient-to-r from-secondary-dim to-secondary p-6 rounded-xl text-on-secondary flex items-center gap-4">
          <span className="material-symbols-outlined text-3xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            home_health
          </span>
          <div>
            <h3 className="font-headline font-bold text-lg">Palliative Home Visit Triggered</h3>
            <p className="text-sm text-on-secondary/80 font-body">
              A palliative care specialist has been recommended for an in-home assessment. Contact your vet to arrange this as soon as possible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
