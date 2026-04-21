"use client";

interface ActivenessModeProps {
  petName: string;
  petSpecies: string;
}

export default function ActivenessMode({ petName, petSpecies }: ActivenessModeProps) {
  const isDog = petSpecies.toLowerCase() === "dog";

  return (
    <div className="bg-surface-container-lowest min-h-[500px] rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.05)] border border-outline-variant/10 animate-mode-enter">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">Growth & Activeness</h2>
          <p className="text-on-surface-variant font-body">Optimizing {petName}'s peak development years</p>
        </div>
        <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center text-secondary-dim">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            directions_run
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Activity Streak */}
        <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            <h3 className="font-headline font-bold text-on-surface">Activity Streak</h3>
          </div>
          <div className="flex justify-between items-end gap-2 h-32">
            {[45, 80, 65, 90, 100, 75, 40].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ${i === 4 ? 'bg-primary' : 'bg-primary/20'}`} 
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-label text-on-surface-variant uppercase">
                  {['M','T','W','T','F','S','S'][i]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs font-label text-center mt-4 text-primary">5 Day Streak! 🦴</p>
        </section>

        {/* Daily Score */}
        <section className="bg-gradient-to-br from-secondary to-secondary-dim p-6 rounded-2xl text-on-secondary shadow-lg">
          <h3 className="font-headline font-bold mb-1">Vitality Score</h3>
          <p className="text-on-secondary/70 text-xs mb-6 lowercase">Updated 2h ago</p>
          
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="54.6" className="text-white" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-headline font-black">85</span>
              <span className="text-[10px] font-label uppercase tracking-wider opacity-80">vibrant</span>
            </div>
          </div>
          
          <div className="flex justify-around text-center border-t border-white/10 pt-4">
            <div>
              <p className="text-lg font-bold">2.4k</p>
              <p className="text-[10px] opacity-70">Steps</p>
            </div>
            <div>
              <p className="text-lg font-bold">128</p>
              <p className="text-[10px] opacity-70">Kcal</p>
            </div>
            <div>
              <p className="text-lg font-bold">45m</p>
              <p className="text-[10px] opacity-70">Play</p>
            </div>
          </div>
        </section>

        {/* Play Schedule */}
        <section className="md:col-span-2 bg-surface-container-high/30 p-6 rounded-2xl">
          <h3 className="font-headline font-bold text-on-surface mb-4">Upcoming Stimulation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-tertiary">fetch_dog</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Agility Run</p>
                <p className="text-xs text-on-surface-variant">4:30 PM · Cubbon Park</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary">extension</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Puzzle Feeder</p>
                <p className="text-xs text-on-surface-variant">7:00 PM · Evening Meal</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 opacity-50">
              <span className="material-symbols-outlined text-outline">bedtime</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Calm Down</p>
                <p className="text-xs text-on-surface-variant">9:30 PM · Wind down</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-8 flex justify-center">
        <button className="bg-tertiary text-on-tertiary px-8 py-3 rounded-full font-label text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log Activity
        </button>
      </footer>
    </div>
  );
}
