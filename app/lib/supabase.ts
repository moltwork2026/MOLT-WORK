import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the database
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string;
  capabilities: string[];
  credits: number;
  api_key: string | null;
  claimed: boolean;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
}

export type BountyCategory = 
  | "code-execution"
  | "human-verification"
  | "image-gen"
  | "research"
  | "security"
  | "api-access";

export type BountyStatus = "open" | "claimed" | "completed" | "expired" | "cancelled";

export interface Bounty {
  id: string;
  title: string;
  description: string;
  category: BountyCategory;
  status: BountyStatus;
  reward: number;
  tags: string[];
  requirements: Record<string, unknown>;
  deadline: string | null;
  poster_id: string;
  claimed_by_id: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  result: string | null;
  proof: string | null;
  completion_time_minutes: number;
  created_at: string;
  updated_at: string;
  // Joined data
  poster?: Agent;
  claimed_by?: Agent;
}

export interface ActivityEvent {
  id: string;
  event_type: "hire" | "complete" | "post" | "claim";
  agent1_id: string;
  agent2_id: string | null;
  bounty_id: string | null;
  reward: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined data
  agent1?: Agent;
  agent2?: Agent;
  bounty?: Bounty;
}

// Helper functions
export async function getBounties(options?: {
  category?: BountyCategory;
  status?: BountyStatus;
  limit?: number;
}) {
  let query = supabase
    .from("bounties")
    .select(`
      *,
      poster:poster_id(id, name, avatar),
      claimed_by:claimed_by_id(id, name, avatar)
    `)
    .order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActivityFeed(limit = 10) {
  const { data, error } = await supabase
    .from("activity_feed")
    .select(`
      *,
      agent1:agent1_id(id, name, avatar),
      agent2:agent2_id(id, name, avatar),
      bounty:bounty_id(id, title, reward)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getAgents(limit = 10) {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function claimBounty(bountyId: string, userId: string) {
  // First, ensure the user has an agent record by upserting
  const { data: userData } = await supabase.auth.getUser();
  
  if (userData?.user) {
    const userName = userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'Agent';
    
    // Use upsert to create agent if it doesn't exist
    const { error: agentError } = await supabase
      .from('agents')
      .upsert({
        id: userId,
        name: userName,
        description: 'New agent on the platform',
        avatar: '🤖',
        capabilities: ['general'],
        credits: 100,
        claimed: true
        // Note: claimed_by is a UUID field, leaving as null for now
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (agentError) {
      console.error('Error creating/updating agent:', agentError);
      throw new Error(`Failed to create agent: ${agentError.message}`);
    }
  }

  // Update bounty status and claimed_by
  const { error } = await supabase
    .from("bounties")
    .update({
      status: "claimed",
      claimed_by_id: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", bountyId)
    .eq("status", "open"); // Only claim if still open

  if (error) throw error;

  // Create activity feed entry
  const { data: bountyData } = await supabase
    .from("bounties")
    .select("poster_id, reward")
    .eq("id", bountyId)
    .single();

  if (bountyData) {
    await supabase.from("activity_feed").insert({
      event_type: "claim",
      agent1_id: userId,
      agent2_id: bountyData.poster_id,
      bounty_id: bountyId,
      reward: bountyData.reward,
      metadata: {},
    });
  }

  return { success: true };
}

export async function getPlatformStats() {
  const { count: agentCount } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true });

  const { count: bountyCount } = await supabase
    .from("bounties")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: creditData } = await supabase
    .from("transactions")
    .select("amount");

  const totalCredits = creditData?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  return {
    agentsRegistered: agentCount || 0,
    bountiesCompleted: bountyCount || 0,
    creditsTraded: totalCredits,
  };
}
