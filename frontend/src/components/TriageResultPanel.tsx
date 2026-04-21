"use client";

import { type TriageResponse, SeverityLevel } from "@/lib/triageApi";

interface TriageResultPanelProps {
  result: TriageResponse;
  onClose: () => void;
}

const STATUS_CFG: Record<string, { icon: string; bg: string; text: string; label: string }> = {
  [SeverityLevel.SAFE]: {
    icon: "check_circle",
    bg: "bg-secondary-container",
    text: "text-secondary-dim",
    label: "Safe / Routine",
  },
  [SeverityLevel.MONITOR]: {
    icon: "visibility",
    bg: "bg-[#fff7ed]",
    text: "text-[#d46800]",
    label: "Monitor Closely",
  },
  [SeverityLevel.URGENT]: {
    icon: "priority_high",
    bg: "bg-primary-container/20",
    text: "text-primary",
    label: "Urgent Care",
  },
  [SeverityLevel.CRITICAL]: {
    icon: "emergency",
    bg: "bg-error-container/20",
    text: "text-error",
    label: "CRITICAL EMERGENCY",
  },
  [SeverityLevel.MANDATORY_SAFETY_LOCK]: {
    icon: "lock",
    bg: "bg-error",
    text: "text-on-error",
    label: "MANDATORY SAFETY LOCK",
  },
};

export default function TriageResultPanel({ result, onClose }: TriageResultPanelProps) {
  const cfg = STATUS_CFG[result.status] || STATUS_CFG[SeverityLevel.MONITOR];
  const isEmergency = result.ui_override;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-2xl bg-surface rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.3)] overflow-hidden animate-slide-in-up`}
        style={{ animationDuration: '0.4s' }}
      >
        {/* Header */}
        <div className={`${cfg.bg} p-6 flex items-start justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.text} bg-white/20 backdrop-blur-md`}>
              <span className="material-symbols-outlined text-3xl">{cfg.icon}</span>
            </div>
            <div>
              <h2 className={`text-xl font-headline font-bold ${cfg.text}`}>{cfg.label}</h2>
              <p className={`text-sm font-label opacity-80 ${cfg.text}`}>Session: {result.session_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Analysis */}
          {result.worker_analysis && (
            <section className="space-y-4">
              <h3 className="text-sm font-label text-on-surface-variant uppercase tracking-widest">AI Clinical Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <p className="text-xs font-label text-on-surface-variant mb-1">Risk Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${result.status === SeverityLevel.CRITICAL ? 'bg-error' : 'bg-primary'}`} 
                        style={{ width: `${result.worker_analysis.risk_score * 100}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-on-surface">{(result.worker_analysis.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                  <p className="text-xs font-label text-on-surface-variant mb-1">Systems Affected</p>
                  <div className="flex flex-wrap gap-1">
                    {result.worker_analysis.body_systems_affected.map(s => (
                      <span key={s} className="bg-surface-container-high px-2 py-0.5 rounded text-[10px] font-bold uppercase text-on-surface-variant">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Instructions */}
          <section className="space-y-4">
            <h3 className="text-sm font-label text-on-surface-variant uppercase tracking-widest">Safety Instructions</h3>
            <div className="space-y-3">
              {result.safety_instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-secondary-dim">{idx + 1}</span>
                  </div>
                  <p className="text-sm font-body text-on-surface leading-relaxed">{inst.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          {result.worker_analysis?.recommended_actions && (
            <section className="space-y-4">
              <h3 className="text-sm font-label text-on-surface-variant uppercase tracking-widest">Recommended Actions</h3>
              <ul className="space-y-2">
                {result.worker_analysis.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-body text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">arrow_right_alt</span>
                    {act}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex flex-col sm:flex-row gap-3">
          {isEmergency ? (
            <a 
              href="tel:+918022221188"
              className="flex-1 bg-error text-on-error font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(179,27,37,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">call</span>
              CALL EMERGENCY VET NOW
            </a>
          ) : (
            <button 
              onClick={onClose}
              className="flex-1 bg-primary text-on-primary font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(166,51,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">check</span>
              I UNDERSTAND
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-4 border border-outline-variant text-on-surface-variant font-label rounded-xl hover:bg-surface-container transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
