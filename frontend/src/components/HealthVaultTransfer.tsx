"use client";

import { useState } from "react";
import {
  initiateHealthVaultTransfer,
  lookupOwnerByEmail,
  getPetHealthVault,
  type HealthRecord,
  type TransferResult,
} from "@/lib/healthVault";

interface HealthVaultTransferProps {
  petId: string;
  petName: string;
  fromOwnerId: string;
}

type Step = "idle" | "preview" | "confirm" | "processing" | "success" | "error";

const RECORD_TYPE_ICONS: Record<string, string> = {
  vaccination: "vaccines",
  deworming: "medication",
  allergy: "warning",
  surgery: "surgical",
  diagnosis: "diagnosis",
  medication: "pill",
  lab_result: "biotech",
  behavioral_note: "psychology",
  other: "folder",
};

export default function HealthVaultTransfer({
  petId,
  petName,
  fromOwnerId,
}: HealthVaultTransferProps) {
  const [step, setStep] = useState<Step>("idle");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    setError(null);
    if (!recipientEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep("processing");
    const [owner, vaultRecords] = await Promise.all([
      lookupOwnerByEmail(recipientEmail),
      getPetHealthVault(petId),
    ]);
    if (!owner) {
      setError("No verified owner found with that email address.");
      setStep("idle");
      return;
    }
    setRecipientId(owner.id);
    setRecipientName(owner.full_name);
    setRecords(vaultRecords);
    setStep("preview");
  }

  async function handleConfirmTransfer() {
    if (!recipientId) return;
    setStep("processing");
    const res = await initiateHealthVaultTransfer(
      petId,
      fromOwnerId,
      recipientId,
      notes
    );
    setResult(res);
    setStep(res.success ? "success" : "error");
    if (!res.success) setError(res.error ?? "Transfer failed.");
  }

  function handleReset() {
    setStep("idle");
    setRecipientEmail("");
    setNotes("");
    setRecipientId(null);
    setRecipientName(null);
    setRecords([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-outline-variant/10">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary to-secondary-dim p-8 text-on-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-on-secondary/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">folder_shared</span>
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">Health Vault Transfer</h2>
            <p className="text-on-secondary/80 text-sm font-body mt-0.5">
              Securely transferring <strong>{petName}</strong>'s biological identity
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* ── Idle: Enter recipient ───────────────────────────── */}
        {(step === "idle" || (step === "processing" && !recipientId)) && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-label text-on-surface-variant mb-2 uppercase tracking-wider">
                Recipient's Registered Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-on-surface-variant text-[20px]">
                  person_search
                </span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePreview()}
                  placeholder="new.guardian@example.com"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-secondary text-on-surface py-3 pl-12 pr-4 focus:outline-none transition-colors font-body"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-label text-on-surface-variant mb-2 uppercase tracking-wider">
                Transfer Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for transfer, special instructions..."
                rows={3}
                className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-secondary text-on-surface py-3 px-4 focus:outline-none transition-colors font-body resize-none"
              />
            </div>
            {error && (
              <p className="text-error font-body text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </p>
            )}
            <button
              onClick={handlePreview}
              disabled={step === "processing"}
              className="w-full bg-secondary text-on-secondary font-headline font-bold py-4 rounded-lg flex items-center justify-center gap-3 transition-all hover:bg-secondary-dim active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">search</span>
              Verify Recipient & Preview Vault
            </button>
          </div>
        )}

        {/* ── Preview: Show records + confirm ────────────────── */}
        {step === "preview" && (
          <div className="space-y-6">
            {/* Recipient info */}
            <div className="bg-surface-container p-4 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-dim">verified_user</span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">{recipientName}</p>
                <p className="text-sm font-body text-on-surface-variant">{recipientEmail}</p>
              </div>
              <div className="ml-auto">
                <span className="bg-secondary-container text-secondary-dim text-xs font-label px-3 py-1 rounded-full">
                  KYC Verified
                </span>
              </div>
            </div>

            {/* Records being transferred */}
            <div>
              <h3 className="text-lg font-headline text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-dim">folder_open</span>
                Biological Identity — {records.length} Records
              </h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {records.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      {RECORD_TYPE_ICONS[r.record_type] ?? "description"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-label text-sm text-on-surface truncate">{r.title}</p>
                      <p className="text-xs text-on-surface-variant font-body capitalize">
                        {r.record_type.replace("_", " ")} · {r.administered_at}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[16px]">check_circle</span>
                  </li>
                ))}
                {records.length === 0 && (
                  <li className="text-sm text-on-surface-variant font-body text-center py-4">
                    No health records found for this pet.
                  </li>
                )}
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-primary-container/20 border border-primary/20 rounded-lg p-4 flex gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">warning</span>
              <p className="text-sm font-body text-on-surface">
                <strong>Irreversible action:</strong> This will atomically transfer all{" "}
                {records.length} health record(s) and ownership of{" "}
                <strong>{petName}</strong> to <strong>{recipientName}</strong>.
                A cryptographic audit trail will be recorded.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 border-2 border-outline-variant text-on-surface-variant font-label py-3 rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="flex-1 bg-secondary text-on-secondary font-headline font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary-dim active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">lock_transfer</span>
                Confirm Transfer
              </button>
            </div>
          </div>
        )}

        {/* ── Processing spinner ──────────────────────────────── */}
        {step === "processing" && recipientId && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 border-4 border-secondary-container border-t-secondary rounded-full animate-spin" />
            <p className="font-headline text-on-surface">Executing Vault Transfer...</p>
            <p className="text-sm font-body text-on-surface-variant text-center max-w-xs">
              Atomically updating ownership, transferring health records, and recording audit trail.
            </p>
          </div>
        )}

        {/* ── Success ─────────────────────────────────────────── */}
        {step === "success" && result && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl text-secondary-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">Transfer Complete</h3>
              <p className="text-on-surface-variant font-body mt-1">
                {result.records_transferred} health record(s) transferred to {recipientName}
              </p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-label text-on-surface-variant">Transfer ID</span>
                <span className="font-body text-on-surface font-medium truncate ml-4">{result.transfer_id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-label text-on-surface-variant">Records Moved</span>
                <span className="font-body text-on-surface font-medium">{result.records_transferred}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-label text-on-surface-variant">Integrity Hash</span>
                <span className="font-body text-on-surface font-medium font-mono text-xs truncate ml-4">{result.integrity_hash?.slice(0, 16)}...</span>
              </div>
            </div>
            <p className="text-xs font-label text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secured on Sovereign Ledger · Perpetual Audit Trail Active
            </p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {step === "error" && (
          <div className="space-y-4 text-center py-4">
            <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                error
              </span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface">Transfer Failed</h3>
            <p className="text-sm font-body text-on-surface-variant">{error}</p>
            <button
              onClick={handleReset}
              className="w-full bg-surface-container text-on-surface font-label py-3 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
