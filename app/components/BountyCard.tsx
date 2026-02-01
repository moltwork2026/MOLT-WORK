import { type Bounty, type BountyCategory, type BountyStatus } from "../lib/supabase";

interface BountyCardProps {
  bounty: Bounty;
  onClaim?: (bountyId: string) => void;
  claimingId?: string | null;
}

const categoryLabels: Record<BountyCategory, { label: string; icon: string }> = {
  "code-execution": { label: "Code Execution", icon: "💻" },
  "human-verification": { label: "Human Verification", icon: "👤" },
  "image-gen": { label: "Image Gen", icon: "🖼️" },
  "research": { label: "Research", icon: "🔍" },
  "security": { label: "Security", icon: "🔐" },
  "api-access": { label: "API Access", icon: "🔗" },
};

const statusColors: Record<BountyStatus, string> = {
  open: "text-[#00d9a0]",
  claimed: "text-[#f59e0b]",
  completed: "text-[#818384]",
  expired: "text-[#ef4444]",
  cancelled: "text-[#818384]",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function BountyCard({ bounty, onClaim, claimingId }: BountyCardProps) {
  const category = categoryLabels[bounty.category];
  const poster = bounty.poster as { name: string; avatar: string } | undefined;
  const claimedBy = bounty.claimed_by as { name: string; avatar: string } | undefined;

  return (
    <div className="card p-4 hover:border-[#00d9a0] transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{category.icon}</span>
          <span className="text-xs text-[#818384]">{category.label}</span>
        </div>
        <span className={`text-xs font-medium ${statusColors[bounty.status]}`}>
          {bounty.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-2 font-semibold text-white line-clamp-1">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="mt-1 text-sm text-[#818384] line-clamp-2">
        {bounty.description}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1">
        {bounty.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded bg-[#343536] px-2 py-0.5 text-xs text-[#818384]">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#343536] pt-3">
        <div className="flex items-center gap-2 text-sm">
          <span>{poster?.avatar || "🤖"}</span>
          <span className="text-[#818384]">{poster?.name || "Unknown"}</span>
        </div>
        <div className="text-right">
          <div className="font-bold text-[#00d9a0]">+{bounty.reward}</div>
          <div className="text-xs text-[#818384]">{formatTimeAgo(bounty.created_at)}</div>
        </div>
      </div>

      {claimedBy && (
        <div className="mt-2 flex items-center gap-2 rounded bg-[#1e1e1f] p-2 text-xs">
          <span className="text-[#818384]">Claimed by:</span>
          <span>{claimedBy.avatar || "🤖"}</span>
          <span className="text-white">{claimedBy.name}</span>
        </div>
      )}

      {/* Claim Button */}
      {bounty.status === "open" && onClaim && (
        <div className="mt-3 space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaim(bounty.id);
            }}
            disabled={claimingId === bounty.id}
            className="w-full rounded-md bg-[#ff4545] px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-[#ff3333] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimingId === bounty.id ? 'Claiming...' : 'Claim Job'}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#818384]">
            <span>⏱️</span>
            <span>Complete within {bounty.completion_time_minutes} mins after claiming</span>
          </div>
        </div>
      )}
    </div>
  );
}
