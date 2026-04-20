"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

interface AuthScreenProps {
  onSuccess?: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  
  const supabase = createBrowserSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Check your email for the confirmation link!" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--secondary-container),transparent_40%),radial-gradient(circle_at_bottom_left,var(--primary-container),transparent_40%)]">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.12)] border border-outline-variant/10 overflow-hidden">
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary" />
        
        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_person
              </span>
            </div>
            <h1 className="text-3xl font-headline font-black text-on-surface tracking-tighter uppercase">
              PetSentinel
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              {isLogin ? "Welcome back, Guardian." : "Begin your guardianship."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-3.5 pl-12 pr-4 focus:outline-none transition-all font-body rounded-t-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                Secure Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant/40 focus:border-primary text-on-surface py-3.5 pl-12 pr-4 focus:outline-none transition-all font-body rounded-t-lg"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-label flex items-start gap-3 ${
                message.type === "error" ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"
              }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {message.type === "error" ? "error" : "check_circle"}
                </span>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-on-surface text-surface font-headline font-bold uppercase tracking-wider rounded-xl hover:bg-on-surface/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {isLogin ? "login" : "person_add"}
                  </span>
                  {isLogin ? "Login Now" : "Create Account"}
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-label text-on-surface-variant hover:text-primary transition-colors py-2"
            >
              {isLogin ? (
                <>New to PetSentinel? <span className="text-primary font-bold">Sign Up</span></>
              ) : (
                <>Already a Guardian? <span className="text-primary font-bold">Log In</span></>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-surface-container px-10 py-6 border-t border-outline-variant/10 text-center">
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest leading-loose opacity-60">
            Secured via Sovereign Ledger · Protected by AI Triage Heuristics
          </p>
        </div>
      </div>
    </div>
  );
}
