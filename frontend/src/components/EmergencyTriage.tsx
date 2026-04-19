import ServicesGrid from "@/components/ServicesGrid";

export default function EmergencyTriage() {
  return (
    <div className="bg-tertiary-container text-tertiary-dim font-body antialiased min-h-screen flex flex-col pt-16 pb-20">
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        {/* Emergency Pulse Background Element */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-tertiary rounded-full blur-[100px] animate-pulse"></div>
        </div>
        <div className="w-full max-w-2xl z-10 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-tertiary-dim text-tertiary-container rounded-full mb-4 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter uppercase text-tertiary-dim text-shadow-glow leading-tight">
              CRITICAL:<br />ASPIRATION RISK
            </h1>
            <p className="font-body text-xl text-tertiary-dim font-bold uppercase tracking-wider">
              Immediate Action Required
            </p>
          </div>
          {/* 3-Step Checklist (Glassmorphism Card) */}
          <div className="glass-panel p-8 rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.4)] border border-outline-variant/30 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary-dim to-tertiary"></div>
            <h2 className="font-headline font-bold text-2xl mb-6 text-on-surface uppercase tracking-tight border-b border-outline-variant/20 pb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary-dim">checklist</span>
              Emergency Protocol
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-tertiary text-on-tertiary rounded-lg flex items-center justify-center font-headline font-black text-xl">1</div>
                <div>
                  <h3 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">STOP FEEDING IMMEDIATELY</h3>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Remove all food sources. Do not attempt to force feeding.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-tertiary text-on-tertiary rounded-lg flex items-center justify-center font-headline font-black text-xl">2</div>
                <div>
                  <h3 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">DO NOT SYRINGE WATER</h3>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Introducing fluids can worsen aspiration. Keep airways clear.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-tertiary text-on-tertiary rounded-lg flex items-center justify-center font-headline font-black text-xl">3</div>
                <div>
                  <h3 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">CHECK SWALLOW REFLEX</h3>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Observe for signs of choking, coughing, or inability to clear throat.</p>
                </div>
              </li>
            </ul>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-8">
            <button className="w-full min-h-[64px] bg-tertiary-dim text-tertiary-container font-headline font-bold text-xl rounded-md uppercase tracking-wide flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0px_10px_20px_rgba(0,0,0,0.3)] hover:bg-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              Connect to 24/7 Bangalore Emergency Vet
            </button>
            <button className="w-full min-h-[56px] bg-transparent border-2 border-tertiary-dim text-tertiary-dim font-headline font-bold text-lg rounded-md uppercase tracking-wide flex items-center justify-center gap-3 transition-colors hover:bg-tertiary-dim/10 active:scale-95">
              <span className="material-symbols-outlined">play_circle</span>
              Watch Emergency Maneuver Video
            </button>
          </div>
        </div>
      </main>

      {/* Services Grid — shown in Care Mode below triage actions */}
      <div className="bg-surface border-t border-outline-variant/20 pb-8">
        <ServicesGrid />
      </div>
    </div>
  );
}
