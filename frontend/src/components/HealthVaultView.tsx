"use client";

import { useState, useEffect } from "react";
import { getPetHealthVault, type HealthRecord } from "@/lib/healthVault";
import { uploadHealthDoc, type UploadMeta } from "@/lib/storage";

interface HealthVaultViewProps {
  petId: string;
  petName: string;
  ownerId: string;
}

const RECORD_TYPES = [
  { label: "Vaccination", value: "vaccination", icon: "vaccines" },
  { label: "Deworming", value: "deworming", icon: "medication" },
  { label: "Surgery", value: "surgery", icon: "surgical" },
  { label: "Lab Result", value: "lab_result", icon: "biotech" },
  { label: "Medication", value: "medication", icon: "pill" },
  { label: "Other", value: "other", icon: "folder" },
];

export default function HealthVaultView({ petId, petName, ownerId }: HealthVaultViewProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [meta, setMeta] = useState<UploadMeta>({
    record_type: "vaccination",
    title: "",
    administered_at: new Date().toISOString().split("T")[0],
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadRecords();
  }, [petId]);

  async function loadRecords() {
    setLoading(true);
    try {
      const data = await getPetHealthVault(petId);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !meta.title) return;

    setUploading(true);
    const { error } = await uploadHealthDoc(petId, ownerId, file, meta);
    
    if (!error) {
      setShowUpload(false);
      setMeta({ record_type: "vaccination", title: "", administered_at: new Date().toISOString().split("T")[0] });
      setFile(null);
      await loadRecords();
    } else {
      alert(error);
    }
    setUploading(false);
  }

  return (
    <div className="space-y-8 animate-mode-enter">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">Health Vault</h2>
          <p className="text-on-surface-variant font-body">Encrypted biological identity of <strong>{petName}</strong></p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-label flex items-center justify-center gap-2 hover:bg-secondary-dim transition-colors"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Upload Document
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", val: records.length, icon: "inventory_2" },
          { label: "Vaccines", val: records.filter(r => r.record_type === 'vaccination').length, icon: "vaccines" },
          { label: "Integrity", val: "99.9%", icon: "verified" },
          { label: "Vault Size", val: "2.4 MB", icon: "database" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-outline text-[20px] mb-2">{s.icon}</span>
            <p className="text-2xl font-headline font-black text-on-surface">{s.val}</p>
            <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Record List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50">
              <th className="px-6 py-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Document</th>
              <th className="px-6 py-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 font-body">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">description</span>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{r.title}</p>
                      <p className="text-xs text-on-surface-variant italic">by {r.administered_by || "Verified Provider"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-surface-container px-2 py-1 rounded text-on-surface-variant capitalize">
                    {r.record_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {new Date(r.administered_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {r.document_url ? (
                    <a 
                      href={r.document_url} 
                      target="_blank" 
                      className="text-primary hover:underline text-sm font-label"
                    >
                      View Doc
                    </a>
                  ) : (
                    <span className="text-outline text-xs italic">No file</span>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-5xl block mb-2 opacity-20">cloud_off</span>
                  No records found in {petName}'s vault.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-on-surface/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface rounded-3xl p-8 shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-6">Securing New Record</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-label text-on-surface-variant mb-1.5 block">Document Title</label>
                <input 
                  required
                  value={meta.title}
                  onChange={e => setMeta({...meta, title: e.target.value})}
                  className="w-full bg-surface-container-low px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  placeholder="e.g. Annual Rabies Vaccine 2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-label text-on-surface-variant mb-1.5 block">Record Type</label>
                  <select 
                    value={meta.record_type}
                    onChange={e => setMeta({...meta, record_type: e.target.value})}
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl focus:outline-none"
                  >
                    {RECORD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-label text-on-surface-variant mb-1.5 block">Date</label>
                  <input 
                    type="date"
                    value={meta.administered_at}
                    onChange={e => setMeta({...meta, administered_at: e.target.value})}
                    className="w-full bg-surface-container-low px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-label text-on-surface-variant mb-1.5 block">File (PDF/Image)</label>
                <input 
                  type="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-label file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20 transition-all"
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-4 border border-outline-variant rounded-xl font-label text-on-surface-variant"
                >
                  Cancel
                </button>
                <button 
                  disabled={uploading}
                  className="flex-1 py-4 bg-secondary text-on-secondary rounded-xl font-headline font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">upload</span>
                  {uploading ? "Securing..." : "Commit to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
