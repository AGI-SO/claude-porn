import Link from "next/link";
import type { StoryWithAuthor, UserRole } from "@/lib/types";
import { VoteButtons } from "./VoteButtons";
import { ReportButton } from "./ReportButton";
import { DeleteStoryButton } from "./DeleteStoryButton";

interface StoryCardProps {
  story: StoryWithAuthor;
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

export function StoryCard({ story, currentUserId, currentUserRole }: StoryCardProps) {
  const canDelete = currentUserId === story.user_id || currentUserRole === "admin";

  return (
    <article className="card vhs-tracking p-4 flex gap-4 transition-all duration-200">
      <VoteButtons
        storyId={story.id}
        initialScore={story.score}
        initialUserVote={story.user_vote}
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-muted mb-1 italic">
          Aujourd'hui j'ai demandé à Claude de
        </p>
        <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {story.content}
        </p>

        <div className="flex items-center gap-3 mt-3 text-sm text-foreground-muted">
          <Link
            href={`/u/${story.profiles.username}`}
            className="flex items-center gap-2 hover:text-neon-cyan transition-colors"
          >
            {story.profiles.avatar_url ? (
              <img
                src={story.profiles.avatar_url}
                alt=""
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan">
                {story.profiles.username[0].toUpperCase()}
              </div>
            )}
            <span>{story.profiles.username}</span>
          </Link>
          <span>·</span>
          <time>{formatDate(story.created_at)}</time>
          {story.posted_via_mcp && (
            <>
              <span>·</span>
              <span className="text-neon-cyan text-xs" title="Posté via Claude Code MCP">
                via MCP
              </span>
            </>
          )}
          <span className="flex-1" />
          {canDelete && <DeleteStoryButton storyId={story.id} />}
          {canDelete && <span className="text-foreground-muted">·</span>}
          <ReportButton storyId={story.id} />
        </div>
      </div>
    </article>
  );
}
