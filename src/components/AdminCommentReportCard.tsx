"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CommentReportWithDetails } from "@/lib/types";
import Link from "next/link";

interface AdminCommentReportCardProps {
  report: CommentReportWithDetails;
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

export function AdminCommentReportCard({ report }: AdminCommentReportCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleResolve = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await supabase
        .from("comment_reports")
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
        .from("comment_reports")
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

  const handleDeleteComment = async () => {
    if (isLoading) return;
    if (!confirm("Supprimer ce commentaire ? Pas de retour en arrière.")) return;

    setIsLoading(true);

    try {
      // Delete the comment (will cascade delete reports)
      await supabase
        .from("comments")
        .delete()
        .eq("id", report.comments.id);

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
        <span>·</span>
        <Link
          href={`/story/${report.comments.story_id}`}
          className="text-neon-cyan hover:underline"
        >
          Voir la story
        </Link>
      </div>

      {/* Comment content */}
      <div className="bg-background/50 border border-border rounded p-3 mb-4">
        <p className="text-foreground whitespace-pre-wrap break-words text-sm">
          {report.comments.content}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-foreground-muted">
          <time>{formatDate(report.comments.created_at)}</time>
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
          onClick={handleDeleteComment}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-neon-rose/20 text-neon-rose border border-neon-rose rounded hover:bg-neon-rose/30 transition-colors disabled:opacity-50"
        >
          Delete Comment
        </button>
      </div>
    </div>
  );
}
