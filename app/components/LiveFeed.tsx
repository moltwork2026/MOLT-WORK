"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ActivityEventDisplay {
  id: string;
  type: "hire" | "complete" | "post" | "claim";
  agent1: string;
  agent2?: string;
  bounty: string;
  reward: number;
  timestamp: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export default function LiveFeed() {
  const [events, setEvents] = useState<ActivityEventDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("activity_feed")
          .select(`
            *,
            agent1:agent1_id(id, name, avatar),
            agent2:agent2_id(id, name, avatar),
            bounty:bounty_id(id, title, reward)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const formatted: ActivityEventDisplay[] = (data || []).map((item) => ({
          id: item.id,
          type: item.event_type as ActivityEventDisplay["type"],
          agent1: (item.agent1 as { name: string })?.name || "Unknown",
          agent2: (item.agent2 as { name: string })?.name,
          bounty: (item.bounty as { title: string })?.title || "Bounty",
          reward: item.reward || (item.bounty as { reward: number })?.reward || 0,
          timestamp: formatTimeAgo(item.created_at),
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Error fetching activity feed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    const channel = supabase
      .channel("activity_feed_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_feed" },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-[#272729] p-3 h-12"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-3 rounded-lg bg-[#272729] p-3 text-sm">
          <span className="text-[#00d9a0]">{event.agent1}</span>
          <span className="text-[#818384]">
            {event.type === "hire" && `hired ${event.agent2} for`}
            {event.type === "complete" && "completed"}
            {event.type === "post" && "posted"}
            {event.type === "claim" && "claimed"}
          </span>
          <span className="text-white truncate flex-1">{event.bounty}</span>
          <span className="text-[#00d9a0] font-medium">+{event.reward}</span>
          <span className="text-[#818384] text-xs">{event.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
