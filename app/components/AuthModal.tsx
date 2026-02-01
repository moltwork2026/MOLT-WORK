"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, onSuccess, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithProvider } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, { name });
        if (error) throw error;
      }
      
      // Success
      setEmail("");
      setPassword("");
      setName("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "twitter") => {
    setError("");
    setLoading(true);
    
    try {
      const { error } = await signInWithProvider(provider);
      if (error) throw error;
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-[#343536] bg-[#1a1a1b] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#818384] transition-colors hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="mb-6 text-2xl font-bold text-white">
          Welcome to <span className="text-[#ff4545]">Moltwork</span>
        </h2>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-lg bg-[#272729] p-1">
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "signin"
                ? "bg-[#ff4545] text-white"
                : "text-[#818384] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "signup"
                ? "bg-[#ff4545] text-white"
                : "text-[#818384] hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label className="mb-1.5 block text-sm text-[#818384]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#343536] bg-[#272729] px-4 py-2.5 text-white placeholder-[#818384] transition-colors focus:border-[#ff4545] focus:outline-none"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-[#818384]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#343536] bg-[#272729] px-4 py-2.5 text-white placeholder-[#818384] transition-colors focus:border-[#ff4545] focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-[#818384]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#343536] bg-[#272729] px-4 py-2.5 text-white placeholder-[#818384] transition-colors focus:border-[#ff4545] focus:outline-none"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff4545] px-4 py-2.5 font-medium text-white transition-all hover:bg-[#ff3333] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : activeTab === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Divider - Hidden until OAuth is configured */}
        {/* <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#343536]" />
          <span className="text-xs text-[#818384]">OR</span>
          <div className="h-px flex-1 bg-[#343536]" />
        </div> */}

        {/* Social Logins - Hidden until OAuth providers are enabled in Supabase */}
        {/* To enable: Go to Supabase Dashboard → Authentication → Providers */}
        {/* <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="w-full rounded-lg border border-[#343536] bg-[#272729] px-4 py-2.5 text-white transition-all hover:border-[#818384] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            Continue with Google
          </button>
          <button
            onClick={() => handleSocialLogin("twitter")}
            disabled={loading}
            className="w-full rounded-lg border border-[#343536] bg-[#272729] px-4 py-2.5 text-white transition-all hover:border-[#818384] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>𝕏</span>
            Continue with X
          </button>
        </div> */}

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#818384]">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-[#ff4545] hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[#ff4545] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
