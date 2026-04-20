"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getMyPets, type Pet } from "@/lib/healthVault";
import { analyzeSymptoms, assessSeniorRisk, type TriageResponse, type SeniorRiskResponse } from "@/lib/triageApi";

import AuthScreen from "@/components/AuthScreen";
import OnboardingWizard from "@/components/OnboardingWizard";
import PetTransition from "@/components/PetTransition";
import EmergencyTriage from "@/components/EmergencyTriage";
import SilverPawsMode from "@/components/SilverPawsMode";
import ServicesGrid from "@/components/ServicesGrid";

type AppMode = "guardian" | "care" | "silver_paws";

export default function Home() {
  const { user, ownerProfile, loading: authLoading, refreshProfile } = useAuth();
  
  const [mode, setMode] = useState<AppMode>("guardian");
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petsLoading, setPetsLoading] = useState(true);

  const [criticalTriage, setCriticalTriage] = useState<TriageResponse | null>(null);
  const [silverPawsData, setSilverPawsData] = useState<SeniorRiskResponse | null>(null);

  const [triageInput, setTriageInput] = useState("");
  const [triageLoading, setTriageLoading] = useState(false);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      if (user && ownerProfile) {
        setPetsLoading(true);
        const myPets = await getMyPets();
        setPets(myPets);
        if (myPets.length > 0) setActivePet(myPets[0]);
        setPetsLoading(false);
      }
    }
    loadData();
  }, [user, ownerProfile]);

  // 2. Triage Handler
  const handleTriage = useCallback(async () => {
    if (!triageInput.trim() || !activePet) return;
    setTriageLoading(true);
    try {
      const res = await analyzeSymptoms(triageInput, {
        pet_species: activePet.species,
        // Since we don't store age directly in Pet type yet in healthVault.ts, we use a placeholder or extension
        // pet_age_years: calculateAge(activePet.date_of_birth) 
      });
      
      if (res.ui_override || res.status === "CRITICAL" || res.status === "MANDATORY_SAFETY_LOCK") {
        setCriticalTriage(res);
      }
      setTriageInput("");
    } catch (e) {
      console.error("Triage failed", e);
    } finally {
      setTriageLoading(false);
    }
  }, [triageInput, activePet]);

  // 3. Senior Risk Handler (Silver Paws)
  const triggerSilverPaws = useCallback(async () => {
    if (!activePet) return;
    try {
      // Real SaaS risk assessment based on active pet
      const result = await assessSeniorRisk({
        pet_name: activePet.name,
        species: activePet.species,
        age_years: 15, // Placeholder for actual calculation
        weight_kg: 25, // Placeholder
        mobility_score: 5,
        recent_symptoms: "Stiff movement in morning",
      });
      
      if (result.silver_paws_mode) {
        setSilverPawsData(result);
        setMode("silver_paws");
      }
    } catch {
      // Fallback/Demo if backend logic isn't fully ready for the dynamic pet
      setMode("silver_paws");
    }
  }, [activePet]);

  // ── Auth & Onboarding Guard ──────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <AuthScreen onSuccess={refreshProfile} />;
  
  if (user && !ownerProfile) return <OnboardingWizard onComplete={refreshProfile} />;

  // ── Main Dashboard ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Critical Override */}
      {criticalTriage && (
        <div className="fixed inset-0 z-[100] bg-error/10 backdrop-blur-sm flex items-center justify-center p-6">
           {/* CriticalBanner component logic included here or imported */}
           <div className="bg-error-container text-on-error-container p-8 rounded-3xl max-w-lg w-full space-y-4">
              <h1 className="text-3xl font-black uppercase">{criticalTriage.status}</h1>
              <p>{criticalTriage.severity_label}</p>
              <button 
                onClick={() => setCriticalTriage(null)}
                className="w-full py-4 bg-on-error-container text-error-container rounded-xl font-bold"
              >DISMISS EMERGENCY OVERRIDE</button>
           </div>
        </div>
      )}

      <div className="min-h-screen bg-surface flex flex-col font-body relative pb-24">
        {/* Header: Pet Selector */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center font-bold text-secondary-dim">
              {activePet?.name[0]}
            </div>
            <div>
              <h2 className="text-sm font-headline font-black uppercase tracking-tight leading-none">
                {activePet?.name ?? "No Pet Selected"}
              </h2>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-1">
                {activePet?.species} · {ownerProfile?.neighborhood ?? "Scanning Location..."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
             <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">settings</button>
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 w-full">
          {mode === "guardian" && (
            <div className="p-6 space-y-6">
              {/* Pet Identity Header */}
              <PetTransition />
              
              {/* Regional Services Grid (Dynamic location aware) */}
              <ServicesGrid />
            </div>
          )}
          {mode === "care" && <EmergencyTriage />}
          {mode === "silver_paws" && silverPawsData && (
            <SilverPawsMode data={silverPawsData} onDismiss={() => setMode("guardian")} />
          )}
        </main>

        {/* Floating Triage Bar */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-outline-variant/20 flex items-center gap-2 px-4 py-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              value={triageInput}
              onChange={(e) => setTriageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTriage()}
              placeholder={`Ask about ${activePet?.name}...`}
              className="flex-1 bg-transparent text-on-surface font-body text-sm py-2 focus:outline-none"
            />
            <button
              onClick={handleTriage}
              disabled={triageLoading || !triageInput.trim()}
              className="bg-tertiary-dim text-on-tertiary px-4 py-2 rounded-xl font-label text-sm disabled:opacity-40"
            >
              Triage
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-2 rounded-full shadow-2xl border border-outline-variant/20 z-50 flex gap-1">
          <button
            onClick={() => setMode("guardian")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase ${mode === "guardian" ? "bg-secondary-container text-secondary-dim" : "text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]">shield_person</span>
            Guardian
          </button>
          <button
            onClick={() => setMode("care")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase ${mode === "care" ? "bg-tertiary-container text-tertiary-dim" : "text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]">medical_services</span>
            Care
          </button>
          <button
            onClick={triggerSilverPaws}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-xs uppercase ${mode === "silver_paws" ? "bg-primary-container/30 text-primary" : "text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]">elderly</span>
            Palliative
          </button>
        </nav>
      </div>
    </>
  );
}
