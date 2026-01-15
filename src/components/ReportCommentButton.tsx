"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface ReportCommentButtonProps {
  commentId: string;
}

export function ReportCommentButton({ commentId }: ReportCommentButtonProps) {
  const [reported, setReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const supabase = createClient();

  const handleReport = async () => {
    if (reported || isReporting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsReporting(true);

    try {
      await supabase
        .from("comment_reports")
        .insert({ comment_id: commentId, reporter_id: user.id });
      setReported(true);
    } catch {
      // Already reported or error
    }

    setIsReporting(false);
  };

  if (reported) {
    return (
      <span className="text-xs text-neon-orange">Signalé</span>
    );
  }

  return (
    <button
      onClick={handleReport}
      disabled={isReporting}
      className="text-foreground-muted hover:text-neon-orange transition-colors text-xs"
      title="Signaler ce commentaire"
    >
      ⚑ Report
    </button>
  );
}
