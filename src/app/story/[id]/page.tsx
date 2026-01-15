import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StoryCard } from "@/components/StoryCard";
import { CommentForm } from "@/components/CommentForm";
import { CommentCard } from "@/components/CommentCard";
import type { StoryWithAuthor, CommentWithAuthor } from "@/lib/types";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Get user role if logged in
  let currentUserRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    currentUserRole = profile?.role || null;
  }

  // Fetch story with author
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select(`
      *,
      profiles!stories_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (storyError || !story) {
    notFound();
  }

  // Fetch user vote if logged in
  let userVote = null;
  if (user) {
    const { data: voteData } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq("story_id", id)
      .single();

    userVote = voteData?.vote_type || null;
  }

  const storyWithVote: StoryWithAuthor = {
    ...story,
    user_vote: userVote,
  };

  // Fetch comments with author info
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles!comments_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq("story_id", id)
    .order("created_at", { ascending: true });

  const commentsWithAuthor = (comments || []) as unknown as CommentWithAuthor[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Story */}
      <StoryCard
        story={storyWithVote}
        currentUserId={user?.id}
        currentUserRole={currentUserRole}
      />

      {/* Comments section */}
      <div className="space-y-4">
        <h2 className="text-xl font-display neon-cyan">
          Commentaires ({commentsWithAuthor.length})
        </h2>

        {/* Comment form */}
        <CommentForm storyId={id} />

        {/* Comments list */}
        {commentsWithAuthor.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-foreground-muted">
              Aucun commentaire. Fais nous rêver Champion !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commentsWithAuthor.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                currentUserRole={currentUserRole}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
