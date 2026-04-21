"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { analyzeSymptoms, type TriageResponse, SeverityLevel } from "@/lib/triageApi";

// ── Symptom suggestion chips ───────────────────────────────────────────────────
const SYMPTOM_CHIPS = [
  { label: "Lethargy",              icon: "bedtime",        severity: "high"     },
  { label: "Not eating",            icon: "no_meals",       severity: "medium"   },
  { label: "Vomiting",              icon: "sick",           severity: "medium"   },
  { label: "Limping",               icon: "accessibility",  severity: "medium"   },
  { label: "Tongue hanging out",    icon: "crisis_alert",   severity: "critical" },
  { label: "Difficulty breathing",  icon: "air",            severity: "critical" },
  { label: "Seizure or tremors",    icon: "bolt",           severity: "critical" },
  { label: "Unable to stand",       icon: "pets",           severity: "critical" },
  { label: "Blood in stool",        icon: "warning",        severity: "critical" },
  { label: "Loss of appetite",      icon: "restaurant_menu",severity: "medium"   },
  { label: "Excessive thirst",      icon: "water_drop",     severity: "medium"   },
  { label: "Coughing",              icon: "pulmonology",    severity: "medium"   },
] as const;

// ── Status dot config ──────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, { color: string; pulse: boolean; label: string }> = {
  [SeverityLevel.SAFE]:                   { color: "bg-secondary",       pulse: false, label: "SAFE"     },
  [SeverityLevel.MONITOR]:                { color: "bg-[#d46800]",       pulse: false, label: "MONITOR"  },
  [SeverityLevel.URGENT]:                 { color: "bg-primary",         pulse: true,  label: "URGENT"   },
  [SeverityLevel.CRITICAL]:               { color: "bg-error",           pulse: true,  label: "CRITICAL" },
  [SeverityLevel.MANDATORY_SAFETY_LOCK]:  { color: "bg-error",           pulse: true,  label: "LOCK"     },
};

const RECENT_KEY = "petsentinel_recent";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 700;
const MIN_INPUT_FOR_PREVIEW = 12;

type PreviewState = "idle" | "loading" | keyof typeof STATUS_DOT;

interface SmartTriageBarProps {
  onResult: (r: TriageResponse) => void;
  healthContext?: string;
  focusTrigger?: number;
}

export default function SmartTriageBar({ onResult, healthContext, focusTrigger }: SmartTriageBarProps) {
  const [input, setInput]             = useState("");
  const [expanded, setExpanded]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [preview, setPreview]         = useState<PreviewState>("idle");
  const [recent, setRecent]           = useState<string[]>([]);
  const [voiceOn, setVoiceOn]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const inputRef      = useRef<HTMLInputElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recognitionRef = useRef<any>(null);

  // ── Load recent searches (client-only) ──────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // ── Imperative Focus Handle ──────────────────────────────────────────────────
  useEffect(() => {
    if (focusTrigger) {
      inputRef.current?.focus();
      setExpanded(true);
    }
  }, [focusTrigger]);

  // ── Keyboard shortcut Ctrl+K / Cmd+K ────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setExpanded(true);
      }
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  // ── Click-outside to collapse ─────────────────────────────────────────────
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // ── Debounced preview call ────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (input.trim().length < MIN_INPUT_FOR_PREVIEW) {
      setPreview("idle");
      return;
    }
    setPreview("loading");
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await analyzeSymptoms(input, { health_context: healthContext });
        setPreview(r.status as PreviewState);
      } catch {
        setPreview("idle");
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [input, healthContext]);

  // ── Persist recent ────────────────────────────────────────────────────────
  const saveRecent = useCallback((q: string) => {
    setRecent(prev => {
      const updated = [q, ...prev.filter(s => s !== q)].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await analyzeSymptoms(text, { health_context: healthContext });
      saveRecent(text);
      onResult(r);
      setInput("");
      setPreview("idle");
      setExpanded(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message
          : "Backend unreachable — make sure uvicorn is running on :8000"
      );
    } finally {
      setSubmitting(false);
    }
  }, [input, onResult, saveRecent, healthContext]);

  // ── Voice input ────────────────────────────────────────────────────────────
  const handleVoice = useCallback(() => {
    const SR = (typeof window !== "undefined")
      ? ((window as any).SpeechRecognition as new () => any
           || (window as any).webkitSpeechRecognition as new () => any)
      : null;
    if (!SR) { setError("Voice input not supported in this browser."); return; }

    if (voiceOn) {
      (recognitionRef.current as any)?.stop();
      setVoiceOn(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setVoiceOn(true);
    recognition.onresult = (ev: any) => {
      const transcript = Array.from(ev.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
      setExpanded(true);
    };
    recognition.onerror = () => setVoiceOn(false);
    recognition.onend   = () => setVoiceOn(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceOn]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isCritical = preview === SeverityLevel.CRITICAL || preview === SeverityLevel.MANDATORY_SAFETY_LOCK;
  const dotCfg = preview !== "idle" && preview !== "loading" ? STATUS_DOT[preview] : null;

  return (
    <div
      ref={containerRef}
      className={`fixed z-40 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out w-full px-4
        ${expanded ? "bottom-[5.5rem] max-w-2xl" : "bottom-[5.5rem] max-w-xl"}`}
    >
      {/* Error bar */}
      {error && (
        <div className="mb-2 bg-error-container/95 text-on-error-container text-xs font-label px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-sm shadow-lg animate-fade-in-up">
          <span className="material-symbols-outlined text-[15px] flex-shrink-0">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="flex-shrink-0 opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      )}

      <div className={`bg-surface-container-lowest/96 backdrop-blur-2xl rounded-2xl border border-outline-variant/20 shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden transition-all duration-300`}>

        {/* ── Expanded top: Symptom chips ─────────────────────────────────── */}
        {expanded && (
          <div className="px-4 pt-4 pb-3 border-b border-outline-variant/10 animate-fade-in-up">
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2.5">
              Quick symptoms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => { setInput(chip.label.toLowerCase()); inputRef.current?.focus(); }}
                  className={`inline-flex items-center gap-1.5 text-xs font-label px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                    chip.severity === "critical"
                      ? "bg-error/10 border-error/30 text-error hover:bg-error/20"
                      : chip.severity === "high"
                      ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      : "bg-surface-container border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Main input row ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Status indicator */}
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {preview === "loading" ? (
              <div className="w-4 h-4 border-2 border-outline-variant border-t-secondary rounded-full animate-spin" />
            ) : dotCfg ? (
              <div className={`w-3 h-3 rounded-full ${dotCfg.color} ${dotCfg.pulse ? "animate-pulse" : ""}`} />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant/60 text-[20px]">search</span>
            )}
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") { setExpanded(false); inputRef.current?.blur(); }
            }}
            placeholder="Describe symptoms… (Ctrl+K)"
            className="flex-1 bg-transparent text-on-surface font-body text-sm py-1.5 focus:outline-none placeholder:text-on-surface-variant/50"
          />

          {/* Clear */}
          {input && (
            <button
              onClick={() => { setInput(""); setPreview("idle"); inputRef.current?.focus(); }}
              className="flex-shrink-0 text-on-surface-variant hover:text-on-surface transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}

          {/* Voice */}
          <button
            onClick={handleVoice}
            title="Voice input (en-IN)"
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${
              voiceOn
                ? "bg-error text-on-error animate-pulse"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{voiceOn ? "mic_off" : "mic"}</span>
          </button>

          {/* Triage button */}
          <button
            onClick={() => handleSubmit()}
            disabled={submitting || !input.trim()}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-label text-sm transition-all active:scale-95 disabled:opacity-40 ${
              isCritical
                ? "bg-error text-on-error shadow-[0_4px_20px_rgba(179,27,37,0.4)]"
                : "bg-tertiary-dim text-on-tertiary hover:bg-tertiary shadow-[0_4px_12px_rgba(0,84,129,0.25)]"
            }`}
          >
            {submitting
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isCritical ? "emergency" : "send"}
                </span>
            }
            <span className="hidden sm:inline">{isCritical ? "ALERT" : "Triage"}</span>
          </button>
        </div>

        {/* ── Inline preview badge ──────────────────────────────────────────── */}
        {dotCfg && !expanded && (
          <div className={`px-4 py-2 text-xs font-label flex items-center gap-2 border-t border-outline-variant/10 animate-fade-in-up ${
            isCritical ? "bg-error/10 text-error" : "bg-surface-container text-on-surface-variant"
          }`}>
            <div className={`w-2 h-2 rounded-full ${dotCfg.color} ${dotCfg.pulse ? "animate-pulse" : ""}`} />
            Preview: <strong>{dotCfg.label}</strong> — press Enter to confirm
          </div>
        )}

        {/* ── Expanded bottom: Recent searches ─────────────────────────────── */}
        {expanded && recent.length > 0 && (
          <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 animate-fade-in-up">
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Recent</p>
            <ul className="space-y-0.5">
              {recent.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSubmit(s)}
                    className="w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-body text-on-surface-variant hover:bg-surface-container hover:text-on-surface group transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px] text-outline flex-shrink-0">history</span>
                    <span className="flex-1 truncate">{s}</span>
                    <span className="material-symbols-outlined text-[14px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">north_west</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { setRecent([]); localStorage.removeItem(RECENT_KEY); }}
                  className="w-full text-left px-2 py-1.5 text-xs font-label text-outline hover:text-on-surface-variant transition-colors"
                >
                  Clear history
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      {!expanded && (
        <p className="text-center text-xs text-on-surface-variant/35 font-label mt-2 select-none">
          <kbd className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono text-[10px]">Ctrl+K</kbd>
          {" "}to focus · voice input available
        </p>
      )}
    </div>
  );
}
