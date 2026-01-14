"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface VoteButtonsProps {
  storyId: string;
  initialScore: number;
  initialUserVote?: number | null;
}

export function VoteButtons({ storyId, initialScore, initialUserVote }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote ?? null);
  const [isVoting, setIsVoting] = useState(false);
  const supabase = createClient();

  const handleVote = async (voteType: 1 | -1) => {
    setIsVoting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const previousVote = userVote;
    const previousScore = score;

    // Optimistic update
    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      setScore(score - voteType);
    } else {
      // Add or change vote
      const scoreDiff = userVote ? voteType * 2 : voteType;
      setUserVote(voteType);
      setScore(score + scoreDiff);
    }

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from("votes")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", storyId);
      } else if (userVote) {
        // Update vote
        await supabase
          .from("votes")
          .update({ vote_type: voteType })
          .eq("user_id", user.id)
          .eq("story_id", storyId);
      } else {
        // Insert vote
        await supabase
          .from("votes")
          .insert({ user_id: user.id, story_id: storyId, vote_type: voteType });
      }
    } catch {
      // Revert on error
      setUserVote(previousVote);
      setScore(previousScore);
    }

    setIsVoting(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`vote-up text-xl transition-transform hover:scale-110 ${userVote === 1 ? "active" : ""}`}
        title="Ca c'est SOTA"
      >
        ▲
      </button>
      <span className={`text-lg font-bold ${score > 0 ? "neon-rose" : score < 0 ? "neon-orange" : "text-foreground-muted"}`}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`vote-down text-xl transition-transform hover:scale-110 ${userVote === -1 ? "active" : ""}`}
        title="T'es tellement 2022 frère"
      >
        ▼
      </button>
    </div>
  );
}
