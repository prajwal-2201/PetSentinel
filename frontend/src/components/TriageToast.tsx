"use client";

import { useEffect, useState } from "react";
import type { TriageResponse } from "@/lib/triageApi";

interface TriageToastProps {
  result: TriageResponse;
  onDismiss: () => void;
}

const TOAST_CONFIG = {
  SAFE:    { bg: "bg-secondary",       text: "text-on-secondary",      icon: "check_circle",  bar: "bg-on-secondary",       duration: 5000 },
  MONITOR: { bg: "bg-[#d46800]",       text: "text-white",             icon: "info",          bar: "bg-white/30",           duration: 8000 },
  URGENT:  { bg: "bg-primary",         text: "text-on-primary",        icon: "priority_high", bar: "bg-on-primary/30",      duration: 0    },
} as const;

export default function TriageToast({ result, onDismiss }: TriageToastProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const cfg = TOAST_CONFIG[result.status as keyof typeof TOAST_CONFIG];
  const duration = cfg?.duration ?? 6000;

  useEffect(() => {
    if (!visible || duration === 0) return;

    const step = 50;
    const decrement = (step / duration) * 100;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - decrement;
        if (next <= 0) {
          clearInterval(interval);
          setVisible(false);
          onDismiss();
          return 0;
        }
        return next;
      });
    }, step);

    return () => clearInterval(interval);
  }, [visible, duration, onDismiss]);

  if (!visible || !cfg) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-xs w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-in-right`}
    >
      <div className={`${cfg.bg} ${cfg.text} px-5 py-4`}>
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-2xl flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {cfg.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-headline font-bold text-sm uppercase tracking-wider">
                {result.status.replace("_", " ")}
              </p>
              <button onClick={() => { setVisible(false); onDismiss(); }} className="opacity-70 hover:opacity-100 flex-shrink-0">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p className="text-xs font-body opacity-90 leading-relaxed">
              {result.severity_label}
            </p>
            {result.worker_analysis?.recommended_actions?.length ? (
              <p className="text-xs font-label mt-2 opacity-80">
                → {result.worker_analysis.recommended_actions[0]}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Progress bar (auto-dismiss timer) */}
      {duration > 0 && (
        <div className="h-1 bg-black/10">
          <div
            className={`h-1 ${cfg.bar} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
