"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getMyPets, type Pet } from "@/lib/healthVault";

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const { ownerProfile, refreshProfile } = useAuth();
  const [city, setCity] = useState(ownerProfile?.city || "Bangalore");
  const [neighborhood, setNeighborhood] = useState(ownerProfile?.neighborhood || "");
  const [saving, setSaving] = useState(false);
  
  const [pets, setPets] = useState<Pet[]>([]);
  
  useEffect(() => {
    getMyPets().then(setPets);
  }, []);

  async function handleDeletePet(petId: string) {
    if (!confirm("Are you sure you want to release this pet from your pack? This will delete their health vault permanently.")) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.from("pets").delete().eq("id", petId);
    setPets(prev => prev.filter(p => p.id !== petId));
    window.location.reload(); // Refresh entire app state
  }

  async function handleSave() {
    if (!ownerProfile) return;
    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await (supabase as any)
      .from("owners")
      .update({ city, neighborhood })
      .eq("id", ownerProfile.id);

    if (!error) {
      await refreshProfile();
      onClose();
    }
    setSaving(false);
  }

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-on-surface/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-3xl shadow-[0_32px_120px_rgba(0,0,0,0.4)] animate-scale-in">
        <header className="p-8 bg-surface-container-high flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAziUHFu8zHb9NxXMn-sFRIXHK2W6IV3RoitjFJzVELaGZrEfmxdkL2tCvIDZFBTAyJh7rXPHho6fiX-1ghSLYbhDk0zj1KeB1mnLPlD2ZRv-h1snKgSu_NYYM58ySB9QL0cA_vyaYCVDgGMM6rQP2tq_IUtMvRxoCIyWs0LHOiCb92ArKC54pMcyp9XpBKQWJ9H6Pmiq6fcy__D7kNb0I19nWNk45IeeeyqyiFh6dI2K7MeRtmCtwXAR27tkWPHc6bLvOwffv5EvA" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">{ownerProfile?.full_name || "Pet Guardian"}</h2>
              <p className="text-sm font-label text-on-surface-variant opacity-70">Member since 2024</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <span className="material-symbols-outlined text-outline">close</span>
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-widest pl-1">City</label>
            <input 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary px-4 py-3 rounded-t-lg focus:outline-none transition-colors font-body"
              placeholder="e.g. Bangalore"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-widest pl-1">Neighborhood</label>
            <input 
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary px-4 py-3 rounded-t-lg focus:outline-none transition-colors font-body"
              placeholder="e.g. Indiranagar"
            />
          </div>
          
          <div className="pt-4 border-t border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-dim">pets</span>
              Manage Pack
            </h3>
            {pets.length === 0 ? (
               <p className="text-xs text-on-surface-variant font-body mb-2">No active wards in your pack.</p>
            ) : (
               <div className="space-y-2 mb-4">
                 {pets.map(p => (
                   <div key={p.id} className="flex items-center justify-between bg-error-container/10 border border-error/10 p-3 rounded-lg">
                     <div>
                       <p className="text-sm font-bold text-on-surface">{p.name}</p>
                       <p className="text-[10px] uppercase text-on-surface-variant">{p.species}</p>
                     </div>
                     <button 
                       onClick={() => handleDeletePet(p.id)}
                       className="text-xs font-label text-error hover:bg-error/10 px-3 py-1.5 rounded-md transition-colors"
                     >
                       Release
                     </button>
                   </div>
                 ))}
               </div>
            )}
            <p className="text-[10px] text-on-surface-variant leading-tight">Releasing a pet destroys their sovereign health vault for privacy. Proceed with caution.</p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? "Saving..." : "Update Preferences"}
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full bg-surface-container-highest text-error font-label py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-error/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        <footer className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant/10 text-center">
          <p className="text-[10px] font-label text-on-surface-variant/50">
            PetSentinel Sovereign ID: {ownerProfile?.id?.slice(0, 8)}...
          </p>
        </footer>
      </div>
    </div>
  );
}
