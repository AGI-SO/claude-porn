import Link from "next/link";
import type { CommentWithAuthor, UserRole } from "@/lib/types";
import { ReportCommentButton } from "./ReportCommentButton";
import { DeleteCommentButton } from "./DeleteCommentButton";

interface CommentCardProps {
  comment: CommentWithAuthor;
  currentUserId?: string | null;
  currentUserRole?: UserRole | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function CommentCard({ comment, currentUserId, currentUserRole }: CommentCardProps) {
  const canDelete = currentUserId === comment.user_id || currentUserRole === "admin";

  return (
    <article className="bg-surface border border-border rounded p-3">
      <p className="text-foreground whitespace-pre-wrap break-words text-sm mb-2">
        {comment.content}
      </p>

      <div className="flex items-center gap-3 text-xs text-foreground-muted">
        <Link
          href={`/u/${comment.profiles.username}`}
          className="flex items-center gap-2 hover:text-neon-cyan transition-colors"
        >
          {comment.profiles.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt=""
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan">
              {comment.profiles.username[0].toUpperCase()}
            </div>
          )}
          <span>{comment.profiles.username}</span>
        </Link>
        <span>·</span>
        <time>{formatDate(comment.created_at)}</time>
        <span className="flex-1" />
        {canDelete && <DeleteCommentButton commentId={comment.id} />}
        {canDelete && <span className="text-foreground-muted">·</span>}
        <ReportCommentButton commentId={comment.id} />
      </div>
    </article>
  );
}
