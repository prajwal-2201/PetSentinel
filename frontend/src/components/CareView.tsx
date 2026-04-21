"use client";

import { useState } from "react";
import EmergencyTriage from "./EmergencyTriage";

export default function CareView() {
  const [showEmergency, setShowEmergency] = useState(false);

  if (showEmergency) {
    return <EmergencyTriage />;
  }

  return (
    <div className="p-6 space-y-8 font-body animate-in fade-in zoom-in-95 duration-500">
      {/* ── Welcome Header ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#f2f8f5] to-[#e4f0e9] border border-[#d2e5d9] p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-headline font-black text-on-surface mb-2">Daily Wellbeing</h1>
            <p className="text-on-surface-variant font-body">
              Nurture your bond with regular health checks, grooming, and emotional closeness. 
              Prevention is the best form of care.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Daily Touch Scan ──────────────────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-secondary">pan_tool</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">The 2-Minute Scan</h2>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            Make physical exams a positive experience. Gently check these areas daily to catch issues early.
          </p>
          <ul className="space-y-4 flex-1">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-secondary-dim mt-0.5 text-[20px]">visibility</span>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">Eyes & Ears</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Bright, clear eyes. Clean ears with no odor or redness.</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-secondary-dim mt-0.5 text-[20px]">pets</span>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">Paws & Coat</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Smooth coat without bald spots. Soft paw pads and trimmed nails.</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-secondary-dim mt-0.5 text-[20px]">monitor_weight</span>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">Body Condition</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Ribs should be easily felt but not seen. Slight hourglass shape.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* ── Emotional Bonding ──────────────────────────────────────────────── */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-tertiary">psychology</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">Mental Vitality</h2>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            A healthy mind extends their lifespan. Keep them engaged and happy.
          </p>
          <ul className="space-y-4 flex-1">
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-tertiary-dim mt-0.5 text-[20px]">extension</span>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">Puzzle Feeding</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Ditch the bowl. Make them work for their food to simulate foraging.</p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-tertiary-dim mt-0.5 text-[20px]">park</span>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">Sniffaris</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Let them lead the walk. Allow plenty of time for sniffing and environmental exploration.</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* ── Emergency Action ────────────────────────────────────────────────── */}
      <section className="mt-8 border-t border-outline-variant/20 pt-8 flex justify-center">
        <button
          onClick={() => setShowEmergency(true)}
          className="flex items-center gap-3 bg-surface-container py-4 px-6 rounded-2xl hover:bg-error-container/20 hover:text-error hover:border-error/30 text-on-surface-variant transition-all border border-transparent group w-full md:w-auto"
        >
          <span className="material-symbols-outlined text-[24px] group-hover:text-error transition-colors">emergency</span>
          <div className="text-left">
            <p className="font-headline font-bold text-sm">Need immediate help?</p>
            <p className="text-xs opacity-80 font-body">Access emergency protocols & first aid</p>
          </div>
          <span className="material-symbols-outlined text-[18px] ml-4 group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </section>
    </div>
  );
}
