"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Owner info
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [neighborhood, setNeighborhood] = useState("");
  
  // Pet info
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("dog");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");

  const supabase = createBrowserSupabaseClient();

  async function handleFinish() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Create Owner Profile
      const response: any = await supabase
        .from("owners")
        .insert({
          auth_user_id: user.id,
          full_name: fullName,
          email: user.email!,
          city: city,
          neighborhood: neighborhood,
          kyc_verified: false
        } as any)
        .select()
        .single();
      
      const owner = response.data;
      const ownerErr = response.error;

      if (ownerErr) throw ownerErr;

      // 2. Create First Pet
      const petResponse: any = await supabase
        .from("pets")
        .insert({
          owner_id: owner.id,
          name: petName,
          species: species,
          date_of_birth: dob,
          weight_kg: parseFloat(weight) || null,
          status: "active"
        } as any);

      const petErr = petResponse.error;

      if (petErr) throw petErr;

      await refreshProfile();
      onComplete();
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-surface flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,var(--primary-container),transparent_70%)]">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-outline-variant/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Progress Bar */}
        <div className="flex h-1.5 w-full bg-surface-container">
          <div 
            className="bg-primary transition-all duration-500 ease-out h-full" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          {/* Step 1: Owner Bio */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Step 01 / Profile</span>
                <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">What shall we call you?</h2>
                <p className="text-on-surface-variant font-body text-sm">We use your name for legal notices and personalized care alerts.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Full Legal Name</label>
                <input
                  autoFocus
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-4 px-1 focus:outline-none transition-all font-body text-xl placeholder:opacity-30"
                />
              </div>

              <button
                disabled={!fullName.trim()}
                onClick={() => setStep(2)}
                className="w-full h-16 bg-on-surface text-surface font-headline font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30"
              >
                Next Step
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Step 02 / Geography</span>
                <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Where is your home?</h2>
                <p className="text-on-surface-variant font-body text-sm">Legal protections and emergency numbers are neighborhood-specific.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-4 px-1 focus:outline-none transition-all font-body text-lg"
                  >
                    <option value="Bangalore">Bangalore (BBMP)</option>
                    <option value="Mumbai">Mumbai (BMC)</option>
                    <option value="Delhi">Delhi (MCD)</option>
                    <option value="Chennai">Chennai (GCC)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Neighborhood</label>
                  <input
                    autoFocus
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indiranagar"
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-4 px-1 focus:outline-none transition-all font-body text-lg placeholder:opacity-30"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-16 border-2 border-outline-variant text-on-surface font-headline font-bold uppercase tracking-wider rounded-2xl"
                >
                  Back
                </button>
                <button
                  disabled={!neighborhood.trim()}
                  onClick={() => setStep(3)}
                  className="flex-[2] h-16 bg-on-surface text-surface font-headline font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30"
                >
                  Registry
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: First Pet */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-label font-bold text-primary uppercase tracking-[0.2em]">Step 03 / First Ward</span>
                <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Register your first pet</h2>
                <p className="text-on-surface-variant font-body text-sm">We initialize their Sovereign Health Vault immediately.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Pet's Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Luna"
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-3 px-1 focus:outline-none transition-all font-body text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Species</label>
                    <div className="flex bg-surface-container p-1 rounded-xl gap-1">
                      <button 
                        onClick={() => setSpecies("dog")}
                        className={`flex-1 py-2 rounded-lg font-label text-xs uppercase ${species === "dog" ? "bg-secondary-container text-secondary-dim shadow-sm" : "text-on-surface-variant"}`}
                      >Dog</button>
                      <button 
                        onClick={() => setSpecies("cat")}
                        className={`flex-1 py-2 rounded-lg font-label text-xs uppercase ${species === "cat" ? "bg-secondary-container text-secondary-dim shadow-sm" : "text-on-surface-variant"}`}
                      >Cat</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Weight (KG)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-2 px-1 focus:outline-none transition-all font-body text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider pl-1">Birth Date (approx)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-3 px-1 focus:outline-none transition-all font-body"
                  />
                </div>
              </div>

              <button
                disabled={loading || !petName.trim() || !dob}
                onClick={handleFinish}
                className="w-full h-16 bg-on-surface text-surface font-headline font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-95 transition-all disabled:opacity-30"
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Dashboard
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-on-surface-variant font-label text-[10px] uppercase tracking-[0.25em] opacity-40">
        PetSentinel Secure Guard Initialization Protocol
      </div>
    </div>
  );
}
