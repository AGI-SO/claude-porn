import { createClient } from "@/lib/supabase/server";
import { StoryFeed } from "@/components/StoryFeed";
import { notFound } from "next/navigation";
import type { StoryWithAuthor } from "@/lib/types";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Get user's stories
  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      profiles!stories_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Get current user's votes and role
  const { data: { user } } = await supabase.auth.getUser();
  let userVotes: Record<string, number> = {};
  let currentUserRole = null;

  if (user) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    currentUserRole = currentProfile?.role || null;
  }

  if (user && stories && stories.length > 0) {
    const storyIds = stories.map((s: { id: string }) => s.id);
    const { data: votes } = await supabase
      .from("votes")
      .select("story_id, vote_type")
      .eq("user_id", user.id)
      .in("story_id", storyIds);

    if (votes) {
      userVotes = Object.fromEntries(votes.map((v: { story_id: string; vote_type: number }) => [v.story_id, v.vote_type]));
    }
  }

  const storiesWithVotes: StoryWithAuthor[] = (stories || []).map((story: any) => ({
    ...story,
    user_vote: userVotes[story.id] || null,
  }));

  // Calculate stats
  const totalPosts = stories?.length || 0;
  const totalKarma = stories?.reduce((acc: number, s: { score: number }) => acc + s.score, 0) || 0;

  return (
    <div>
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-neon-cyan"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan flex items-center justify-center text-2xl text-neon-cyan">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-display neon-cyan">
              {profile.username}
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex gap-6 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-rose">{totalPosts}</div>
            <div className="text-sm text-foreground-muted">posts</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${totalKarma >= 0 ? "text-neon-rose" : "text-neon-orange"}`}>
              {totalKarma}
            </div>
            <div className="text-sm text-foreground-muted">karma</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-display text-foreground mb-4">
        Ses exploits
      </h2>

      <StoryFeed
        stories={storiesWithVotes}
        currentUserId={user?.id}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
