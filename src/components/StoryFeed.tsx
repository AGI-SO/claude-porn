import { StoryCard } from "./StoryCard";
import type { StoryWithAuthor, UserRole } from "@/lib/types";

interface StoryFeedProps {
  stories: StoryWithAuthor[];
  currentUserId?: string | null;
  currentUserRole?: UserRole | null;
}

export function StoryFeed({ stories, currentUserId, currentUserRole }: StoryFeedProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-muted text-lg">
          Aucune histoire pour le moment...
        </p>
        <p className="text-foreground-muted mt-2">
          Sois le premier à partager ton exploit !
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
}
