"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getMyPets, getPetHealthVault, type Pet, type HealthRecord } from "@/lib/healthVault";
import { analyzeSymptoms, assessSeniorRisk, type TriageResponse, type SeniorRiskResponse } from "@/lib/triageApi";

import AuthScreen from "@/components/AuthScreen";
import OnboardingWizard from "@/components/OnboardingWizard";
import PetTransition from "@/components/PetTransition";
import CareView from "@/components/CareView";
import SilverPawsMode from "@/components/SilverPawsMode";
import ActivenessMode from "@/components/ActivenessMode";
import ServicesGrid from "@/components/ServicesGrid";
import SmartTriageBar from "@/components/SmartTriageBar";
import TriageResultPanel from "@/components/TriageResultPanel";
import HealthVaultView from "@/components/HealthVaultView";
import ProfileSettings from "@/components/ProfileSettings";

type AppMode = "guardian" | "care" | "secondary_nav" | "health_vault";

function calculateAge(dob: string) {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    years--;
  }
  return Math.max(0, years);
}

export default function Home() {
  const { user, ownerProfile, loading: authLoading, refreshProfile } = useAuth();
  
  const [mode, setMode] = useState<AppMode>("guardian");
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petsLoading, setPetsLoading] = useState(true);
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [triageFocusTrigger, setTriageFocusTrigger] = useState(0);

  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [silverPawsData, setSilverPawsData] = useState<SeniorRiskResponse | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      if (user && ownerProfile) {
        setPetsLoading(true);
        const myPets = await getMyPets();
        setPets(myPets);
        if (myPets.length > 0 && !activePet) setActivePet(myPets[0]);
        setPetsLoading(false);
      }
    }
    loadData();
  }, [user, ownerProfile]);

  // 2. Fetch Health Context for Triage
  useEffect(() => {
    if (activePet) {
      getPetHealthVault(activePet.id).then(setHealthRecords);
    }
  }, [activePet]);

  const healthContextSummary = useMemo(() => {
    if (healthRecords.length === 0) return "";
    return healthRecords.map(r => `${r.title} (${r.record_type}) on ${r.administered_at}`).join("; ");
  }, [healthRecords]);

  const petAge = useMemo(() => activePet ? calculateAge(activePet.date_of_birth) : 0, [activePet]);
  const isSenior = useMemo(() => {
    if (!activePet) return false;
    const species = activePet.species.toLowerCase();
    return species === "dog" ? petAge >= 7 : petAge >= 10;
  }, [activePet, petAge]);

  // 3. Senior Risk Handler (Silver Paws)
  const triggerSecondaryNav = useCallback(async () => {
    if (!activePet) return;
    if (isSenior) {
      try {
        const result = await assessSeniorRisk({
          pet_name: activePet.name,
          species: activePet.species,
          age_years: petAge,
          weight_kg: 20, // Default 
          mobility_score: 5,
        });
        setSilverPawsData(result);
        setMode("secondary_nav");
      } catch {
        setMode("secondary_nav");
      }
    } else {
      setMode("secondary_nav");
    }
  }, [activePet, isSenior, petAge]);

  const handleServiceAction = (action: string) => {
    if (action === "health_vault") setMode("health_vault");
    if (action === "triage") {
      setTriageFocusTrigger(Date.now());
    }
    if (action === "senior_risk") triggerSecondaryNav();
  };

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
      {/* Triage Result Panel */}
      {triageResult && (
        <TriageResultPanel 
          result={triageResult} 
          onClose={() => setTriageResult(null)} 
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      <div className="min-h-screen bg-surface flex flex-col font-body relative pb-32">
        {/* Header: Pet Selector */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <button 
            onClick={() => setShowPetPicker(!showPetPicker)}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center font-bold text-secondary-dim shadow-sm group-hover:scale-105 transition-transform">
              {activePet?.name[0]}
            </div>
            <div>
              <h2 className="text-sm font-headline font-black uppercase tracking-tight leading-none flex items-center gap-1.5">
                {activePet?.name ?? "No Pet Selected"}
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:rotate-180 transition-transform">expand_more</span>
              </h2>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-1">
                {activePet?.breed || activePet?.species} · {ownerProfile?.neighborhood ?? "Scanning..."}
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-1">
             <button className="w-10 h-10 flex items-center justify-center material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">notifications</button>
             <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
             >settings</button>
          </div>

          {/* Pet Picker Dropdown */}
          {showPetPicker && (
            <div className="absolute left-6 top-16 w-64 bg-surface-container-highest border border-outline-variant/20 rounded-2xl shadow-xl p-2 animate-scale-in z-50">
              <p className="text-[10px] font-label text-on-surface-variant px-3 py-2 uppercase tracking-widest">My Pack</p>
              {pets.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { setActivePet(p); setShowPetPicker(false); setMode("guardian"); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors ${activePet?.id === p.id ? 'bg-secondary-container/30 border border-secondary/10' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary-dim/10 flex items-center justify-center text-xs font-bold text-secondary-dim">
                    {p.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface">{p.name}</p>
                    <p className="text-[9px] text-on-surface-variant uppercase">{p.species}</p>
                  </div>
                </button>
              ))}
              <div className="border-t border-outline-variant/10 mt-2 pt-2">
                <button 
                  onClick={() => window.location.reload()} // Easy way to re-onboard/add
                  className="w-full flex items-center gap-3 p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors text-xs font-label"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Register New Pet
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content View */}
        <main className="flex-1 w-full max-w-4xl mx-auto">
          {mode === "guardian" && (
            <div className="p-6 space-y-8">
              <PetTransition ownerProfile={ownerProfile} />
              <ServicesGrid onServiceAction={handleServiceAction} />
            </div>
          )}
          {mode === "care" && <CareView />}
          {mode === "secondary_nav" && (
            <div className="p-6">
              {isSenior ? (
                <SilverPawsMode data={silverPawsData || undefined} onDismiss={() => setMode("guardian")} />
              ) : (
                <ActivenessMode petName={activePet?.name || "Pet"} petSpecies={activePet?.species || "Dog"} />
              )}
            </div>
          )}
          {mode === "health_vault" && activePet && ownerProfile && (
            <div className="p-6">
              <HealthVaultView petId={activePet.id} petName={activePet.name} ownerId={ownerProfile.id} />
            </div>
          )}
        </main>

        {/* Floating Triage Bar */}
        <SmartTriageBar 
          onResult={(r) => setTriageResult(r)} 
          healthContext={healthContextSummary}
          focusTrigger={triageFocusTrigger}
        />

        {/* Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/95 backdrop-blur-md px-2 py-2 rounded-full shadow-2xl border border-outline-variant/20 z-50 flex gap-1">
          <button
            onClick={() => setMode("guardian")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-[11px] uppercase tracking-wider ${mode === "guardian" ? "bg-secondary-container text-secondary-dim shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: mode === "guardian" ? "'FILL' 1" : "" }}>home</span>
            Guardian
          </button>
          <button
            onClick={() => setMode("care")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-[11px] uppercase tracking-wider ${mode === "care" ? "bg-tertiary-container text-tertiary-dim shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: mode === "care" ? "'FILL' 1" : "" }}>medical_services</span>
            Care
          </button>
          <button
            onClick={triggerSecondaryNav}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-label text-[11px] uppercase tracking-wider ${mode === "secondary_nav" ? "bg-primary-container/40 text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: mode === "secondary_nav" ? "'FILL' 1" : "" }}>
              {isSenior ? "elderly" : "directions_run"}
            </span>
            {isSenior ? "Palliative" : "Activeness"}
          </button>
        </nav>
      </div>
    </>
  );
}
