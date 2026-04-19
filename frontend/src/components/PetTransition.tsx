export default function PetTransition() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0 font-body">
      <header className="w-full top-0 sticky flex justify-between items-center px-6 h-16 z-40 bg-surface-container-low border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">security</span>
          <span className="text-xl font-bold font-headline text-on-surface tracking-tight">Sovereign Pet</span>
        </div>
        <div className="flex items-center">
          <img alt="User Profile" className="w-8 h-8 rounded-full border border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAziUHFu8zHb9NxXMn-sFRIXHK2W6IV3RoitjFJzVELaGZrEfmxdkL2tCvIDZFBTAyJh7rXPHho6fiX-1ghSLYbhDk0zj1KeB1mnLPlD2ZRv-h1snKgSu_NYYM58ySB9QL0cA_vyaYCVDgGMM6rQP2tq_IUtMvRxoCIyWs0LHOiCb92ArKC54pMcyp9XpBKQWJ9H6Pmiq6fcy__D7kNb0I19nWNk45IeeeyqyiFh6dI2K7MeRtmCtwXAR27tkWPHc6bLvOwffv5EvA" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-12 pb-16 space-y-16">
        <section className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-headline text-on-surface mb-6 leading-tight">Transition of Guardianship</h1>
          <p className="text-lg text-on-surface-variant font-body leading-relaxed pr-8">
            Establishing a secure and verified environment for the permanent transfer of care. All prospective guardians undergo strict identity and facility verification protocols.
          </p>
        </section>

        <section className="bg-surface-container-low p-8 rounded-lg">
          <h2 className="text-2xl font-headline text-secondary mb-6">Verified Family Search</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant">search</span>
              <input className="w-full bg-surface-container-lowest border-b border-outline-variant/15 focus:border-secondary text-on-surface py-3 pl-12 pr-4 rounded-t-sm focus:outline-none focus:ring-0 transition-colors font-body" placeholder="Search verified registries..." type="text" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded-full text-sm font-label transition-colors">
              <span className="material-symbols-outlined text-[18px]">check</span>
              Asthma-Friendly Home
            </button>
            <button className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded-full text-sm font-label transition-colors">
              <span className="material-symbols-outlined text-[18px]">check</span>
              Fenced Yard
            </button>
            <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high px-4 py-2 rounded-full text-sm font-label transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Additional Criteria
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-headline text-on-surface mb-8 border-b border-surface-container-high pb-4">Approved Registrants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_20px_50px_rgba(48,51,52,0.06)] relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 bg-secondary text-on-secondary text-xs font-label px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                KYC Verified
              </div>
              <div className="flex items-start gap-5 mb-6 mt-2">
                <img alt="Eleanor Sterling" className="w-16 h-16 rounded-full object-cover border border-surface-container-high shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGcwUOrBWxWm1jopIHGeLK_fhXZzPFfWL_CPsgm_cFXa21cn_AIOVfiVm4B8bmeCpkzsMUzBd6ZpAHVlgtGfjdLcA7HxKhiD8152mzSl-oP5CPyIBDkPOiAqT0g6PbqEjylfM5rX1SFnnJMmtutdQbFEhI4EX2Omj7y5i7gQpv2ptOiYg9rXX1VUAjLJAYDzKAZZpmALlyi0nGRM3FrhaWq8O5g6WBJ_A9mzoTdqtB901jZ1KlVcFgBlTc3teB-DVOI9rWlUwFvgU" />
                <div>
                  <h3 className="text-xl font-headline text-on-surface">Eleanor Sterling</h3>
                  <p className="text-sm text-on-surface-variant font-body">Registered: Oct 2023</p>
                  <div className="flex items-center gap-1 mt-1 text-secondary text-sm">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>Portland, OR</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm text-on-surface-variant font-label">Facility Check</span>
                  <span className="text-sm text-on-surface font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">done</span> Passed</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm text-on-surface-variant font-label">Veterinary Ref</span>
                  <span className="text-sm text-on-surface font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">done</span> Cleared</span>
                </div>
              </div>
              <button className="w-full bg-surface-container-high hover:bg-surface-container text-on-surface font-label py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2">
                View Full Dossier
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </article>

            <article className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_20px_50px_rgba(48,51,52,0.06)] relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 bg-secondary text-on-secondary text-xs font-label px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                KYC Verified
              </div>
              <div className="flex items-start gap-5 mb-6 mt-2">
                <img alt="Marcus Vance" className="w-16 h-16 rounded-full object-cover border border-surface-container-high shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFF7a9ioHNHIdBWgzjt2Zw2-ulaC69bZobBHIgWNHuIAelWUoQ6_1-8FTRXngUWcwGUjltmDuScukbwdI4QeTmMG80DZb5VrahzVRd2-Twn8-QH72vnta17FBWRkbWRvBx6hxy9D1FrfvIt44JwT1kKjlWprTkLFeKby810-9oJYu5jggOhmtBCYhUGuoU2q5jXT09vlmyymgAzLBh49eJ-oJapzQGF32KG69pkF5uY2O0anHwfAQ8fvpuOMAO4d4SzVIgq0YImfU" />
                <div>
                  <h3 className="text-xl font-headline text-on-surface">Marcus Vance</h3>
                  <p className="text-sm text-on-surface-variant font-body">Registered: Jan 2024</p>
                  <div className="flex items-center gap-1 mt-1 text-secondary text-sm">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>Seattle, WA</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm text-on-surface-variant font-label">Facility Check</span>
                  <span className="text-sm text-on-surface font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">done</span> Passed</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-container-low">
                  <span className="text-sm text-on-surface-variant font-label">Veterinary Ref</span>
                  <span className="text-sm text-on-surface font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">done</span> Cleared</span>
                </div>
              </div>
              <button className="w-full bg-surface-container-high hover:bg-surface-container text-on-surface font-label py-3 rounded-sm transition-colors text-sm flex items-center justify-center gap-2">
                View Full Dossier
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </article>
          </div>
        </section>

        <section className="bg-gradient-to-br from-secondary to-secondary-dim p-10 rounded-lg text-on-secondary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-3xl">folder_shared</span>
                <h2 className="text-3xl font-headline text-on-secondary">Health Vault Transfer</h2>
              </div>
              <p className="text-secondary-container font-body mb-6 text-sm max-w-md text-white/90">
                Preparing medical records, vaccination certificates, and behavioral logs for encrypted handover.
              </p>
              <div className="space-y-2 mb-2">
                <div className="flex justify-between text-sm font-label text-on-secondary">
                  <span>Compilation Status</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-secondary-dim rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary-container h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <p className="text-xs text-on-secondary/80 font-label mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span> Secured via Sovereign Ledger
              </p>
            </div>
            <div className="w-full md:w-auto bg-surface-container-highest/20 backdrop-blur-[24px] p-6 rounded-lg border border-white/10 min-w-[280px]">
              <h3 className="text-lg font-headline mb-4 border-b border-white/20 pb-2 text-on-secondary">Pending Documents</h3>
              <ul className="space-y-3 font-label text-sm text-on-secondary">
                <li className="flex items-center gap-3 opacity-70">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Rabies Certificate
                </li>
                <li className="flex items-center gap-3 opacity-70">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Microchip Registry
                </li>
                <li className="flex items-center gap-3 text-secondary-container">
                  <span className="material-symbols-outlined text-[18px] animate-pulse">hourglass_empty</span>
                  Behavioral Addendum
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
