"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_LENGTH = 1000;

interface CommentFormProps {
  storyId: string;
}

export function CommentForm({ storyId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Balance quelque chose, fais pas ton timide.");
      return;
    }

    if (content.length > MAX_LENGTH) {
      setError(`Maximum ${MAX_LENGTH} caractères`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const { error: insertError } = await supabase
      .from("comments")
      .insert({ user_id: user.id, story_id: storyId, content: content.trim() } as any);

    if (insertError) {
      setError("Erreur de transmission. Réessaie !");
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dis nous ce que tu en penses"
        className="w-full h-24 p-3 bg-surface border border-border rounded text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan resize-none text-sm"
        maxLength={MAX_LENGTH}
      />
      <div className="flex justify-between items-center">
        <span className={`text-xs ${error ? "text-neon-orange" : "text-foreground-muted"}`}>
          {error || ""}
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${content.length > MAX_LENGTH * 0.9 ? "text-neon-orange" : "text-foreground-muted"}`}>
            {content.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-neon px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : "Commenter"}
          </button>
        </div>
      </div>
    </form>
  );
}
