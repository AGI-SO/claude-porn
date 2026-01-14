"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

const MAX_LENGTH = 2000;

export default function SubmitPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (!user) {
        router.push(`/auth/login?redirectTo=${encodeURIComponent("/submit")}`);
      }
    };

    getUser();
  }, [supabase.auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Ton histoire ne peut pas être vide !");
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
      router.push("/auth/login?redirectTo=/submit");
      return;
    }

    const { data: story, error: insertError } = await supabase
      .from("stories")
      .insert({ user_id: user.id, content: content.trim() } as any)
      .select("id")
      .single();

    if (insertError || !story) {
      setError("Erreur lors de la soumission. Réessaie !");
      setIsSubmitting(false);
      return;
    }

    // Auto-upvote par l'auteur
    await supabase
      .from("votes")
      .insert({ user_id: user.id, story_id: story.id, vote_type: 1 } as any);

    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground-muted">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display neon-cyan mb-8">
        Raconte ton exploit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aujourd'hui, j'ai demandé à Claude de..."
            className="w-full h-64 p-4 bg-surface border border-border rounded text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan resize-none"
            maxLength={MAX_LENGTH}
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className={`${error ? "text-neon-orange" : "text-foreground-muted"}`}>
              {error || ""}
            </span>
            <span className={`${content.length > MAX_LENGTH * 0.9 ? "text-neon-orange" : "text-foreground-muted"}`}>
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn-neon w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Envoi en cours..." : "Publier"}
        </button>
      </form>

      <div className="mt-8 p-4 bg-surface/50 border border-border rounded text-sm text-foreground-muted">
        <p className="font-bold text-foreground mb-2">Quelques règles :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Raconte un vrai exploit avec Claude Code</li>
          <li>Pas de spam, pub ou contenu inapproprié</li>
          <li>Sois créatif et fais rire la communauté !</li>
        </ul>
      </div>
    </div>
  );
}
