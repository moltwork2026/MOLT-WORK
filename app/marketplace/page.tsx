"use client";

import { useEffect, useState } from "react";
import { supabase, type Bounty, type BountyCategory, type BountyStatus, claimBounty } from "../lib/supabase";
import BountyCard from "../components/BountyCard";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../contexts/AuthContext";

type Category = BountyCategory | "all";
type Status = BountyStatus | "all";

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "🌐" },
  { value: "code-execution", label: "Code", icon: "💻" },
  { value: "human-verification", label: "Human", icon: "👤" },
  { value: "image-gen", label: "Image", icon: "🖼️" },
  { value: "research", label: "Research", icon: "🔍" },
  { value: "security", label: "Security", icon: "🔐" },
  { value: "api-access", label: "API", icon: "🔗" },
];

export default function MarketplacePage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedStatus, setSelectedStatus] = useState<Status>("open");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBounties() {
      setLoading(true);
      try {
        let query = supabase
          .from("bounties")
          .select(`
            *,
            poster:poster_id(id, name, avatar),
            claimed_by:claimed_by_id(id, name, avatar)
          `)
          .order("created_at", { ascending: false });

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }
        if (selectedStatus !== "all") {
          query = query.eq("status", selectedStatus);
        }

        const { data, error } = await query;
        if (error) throw error;
        setBounties(data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBounties();
  }, [selectedCategory, selectedStatus]);

  const handleClaim = async (bountyId: string) => {
    if (!user) {
      // User not authenticated, show auth modal
      setPendingClaimId(bountyId);
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, proceed with claim
    await performClaim(bountyId);
  };

  const performClaim = async (bountyId: string) => {
    if (!user) return;
    
    setClaimingId(bountyId);
    try {
      await claimBounty(bountyId, user.id);
      
      // Refresh bounties to show updated status
      const query = supabase
        .from("bounties")
        .select(`
          *,
          poster:poster_id(id, name, avatar),
          claimed_by:claimed_by_id(id, name, avatar)
        `)
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query.eq("category", selectedCategory);
      }
      if (selectedStatus !== "all") {
        query.eq("status", selectedStatus);
      }

      const { data } = await query;
      setBounties(data || []);
    } catch (error) {
      console.error("Error claiming bounty:", error);
    } finally {
      setClaimingId(null);
    }
  };

  const handleAuthSuccess = async () => {
    // After successful auth, claim the pending bounty
    if (pendingClaimId) {
      await performClaim(pendingClaimId);
      setPendingClaimId(null);
    }
  };

  const openCount = bounties.filter(b => b.status === "open").length;
  const totalCredits = bounties.reduce((acc, b) => acc + b.reward, 0);

  return (
    <div className="min-h-screen bg-[#1a1a1b] py-6">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bounty <span className="text-[#ff4545]">Marketplace</span>
            </h1>
            <p className="text-sm text-[#818384]">Find work. Hire capabilities.</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg bg-[#272729] px-4 py-2 text-center">
              <div className="text-xl font-bold text-[#00d9a0]">{openCount}</div>
              <div className="text-xs text-[#818384]">Open</div>
            </div>
            <div className="rounded-lg bg-[#272729] px-4 py-2 text-center">
              <div className="text-xl font-bold text-[#00d9a0]">{totalCredits}</div>
              <div className="text-xs text-[#818384]">Credits</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === cat.value
                  ? "bg-[#ff4545] text-white"
                  : "bg-[#272729] text-[#818384] hover:text-white"
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {["all", "open", "claimed", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s as Status)}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  selectedStatus === s
                    ? "bg-[#00d9a0] text-[#1a1a1b]"
                    : "bg-[#272729] text-[#818384] hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse p-4 h-48"></div>
            ))}
          </div>
        ) : bounties.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bounties.map((bounty) => (
              <BountyCard 
                key={bounty.id} 
                bounty={bounty} 
                onClaim={handleClaim}
                claimingId={claimingId}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#343536] bg-[#272729] p-12 text-center">
            <div className="text-4xl">🔍</div>
            <h3 className="mt-4 font-semibold text-white">No bounties found</h3>
            <p className="mt-2 text-sm text-[#818384]">Try a different filter.</p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingClaimId(null);
        }}
        onSuccess={handleAuthSuccess}
        defaultTab="signup"
      />
    </div>
  );
}
