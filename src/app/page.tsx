import { createClient } from "@/lib/supabase/server";
import { StoryFeed } from "@/components/StoryFeed";
import { HeroSection } from "@/components/HeroSection";
import Link from "next/link";
import type { StoryWithAuthor } from "@/lib/types";

interface HomePageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sort = "recent" } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  let query = supabase
    .from("stories")
    .select(
      `
      *,
      profiles!stories_user_id_fkey (
        username,
        avatar_url
      ),
      comments (count)
    `
    )
    .limit(50);

  if (sort === "top") {
    query = query.order("score", { ascending: false });
  } else if (sort === "top-week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    query = query
      .gte("created_at", oneWeekAgo.toISOString())
      .order("score", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: stories, error } = await query;
  if (error) console.error("Stories fetch error:", error);

  // Get user votes if logged in
  let userVotes: Record<string, number> = {};
  if (user && stories && stories.length > 0) {
    const storyIds = stories.map((s: { id: string }) => s.id);
    const { data: votes } = await supabase
      .from("votes")
      .select("story_id, vote_type")
      .eq("user_id", user.id)
      .in("story_id", storyIds);

    if (votes) {
      userVotes = Object.fromEntries(
        votes.map((v: { story_id: string; vote_type: number }) => [
          v.story_id,
          v.vote_type,
        ])
      );
    }
  }

  const storiesWithVotes: StoryWithAuthor[] = (stories || []).map(
    (story: any) => ({
      ...story,
      user_vote: userVotes[story.id] || null,
      comment_count: story.comments?.[0]?.count || 0,
    })
  );

  return (
    <div>
      <HeroSection />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display neon-cyan">Vu à la télé</h2>
      </div>

      <nav className="flex gap-2 mb-6">
        <SortLink href="/?sort=recent" active={sort === "recent"}>
          Fresh
        </SortLink>
        <SortLink href="/?sort=top" active={sort === "top"}>
          Hall of Fame
        </SortLink>
        <SortLink href="/?sort=top-week" active={sort === "top-week"}>
          Hot cette semaine
        </SortLink>
      </nav>

      <StoryFeed
        stories={storiesWithVotes}
        currentUserId={user?.id}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded text-sm transition-all ${
        active
          ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan"
          : "text-foreground-muted hover:text-foreground border border-transparent"
      }`}
    >
      {children}
    </Link>
  );
}
