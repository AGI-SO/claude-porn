"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportWithDetails } from "@/lib/types";

interface AdminReportCardProps {
  report: ReportWithDetails;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminReportCard({ report }: AdminReportCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleResolve = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await supabase
        .from("reports")
        .update({
          status: "resolved",
          admin_note: adminNote || null,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      router.refresh();
    } catch (err) {
      console.error("Resolve error:", err);
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await supabase
        .from("reports")
        .update({
          status: "dismissed",
          admin_note: adminNote || null,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      router.refresh();
    } catch (err) {
      console.error("Dismiss error:", err);
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async () => {
    if (isLoading) return;
    if (!confirm("Supprimer cette story ? Cette action est irreversible.")) return;

    setIsLoading(true);

    try {
      // Delete the story (will cascade delete reports)
      await supabase
        .from("stories")
        .delete()
        .eq("id", report.stories.id);

      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-4">
      {/* Reporter info */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted mb-3">
        <span>Report de</span>
        <span className="text-neon-cyan">{report.reporter.username}</span>
        <span>·</span>
        <time>{formatDate(report.created_at)}</time>
        {report.reason && (
          <>
            <span>·</span>
            <span className="text-neon-orange">{report.reason}</span>
          </>
        )}
      </div>

      {/* Story content */}
      <div className="bg-background/50 border border-border rounded p-3 mb-4">
        <p className="text-foreground whitespace-pre-wrap break-words text-sm">
          {report.stories.content}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-foreground-muted">
          <span>Score: {report.stories.score}</span>
          <span>·</span>
          <time>{formatDate(report.stories.created_at)}</time>
        </div>
      </div>

      {/* Admin note */}
      <div className="mb-4">
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Note admin (optionnel)..."
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-neon-cyan resize-none"
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleResolve}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-neon-cyan/20 text-neon-cyan border border-neon-cyan rounded hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
        >
          Resolve (OK)
        </button>
        <button
          onClick={handleDismiss}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-foreground-muted/20 text-foreground-muted border border-foreground-muted rounded hover:bg-foreground-muted/30 transition-colors disabled:opacity-50"
        >
          Dismiss
        </button>
        <button
          onClick={handleDeleteStory}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-neon-rose/20 text-neon-rose border border-neon-rose rounded hover:bg-neon-rose/30 transition-colors disabled:opacity-50"
        >
          Delete Story
        </button>
      </div>
    </div>
  );
}
