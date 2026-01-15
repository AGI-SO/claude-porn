"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

const MAX_LENGTH = 2000;

const PLACEHOLDERS = [
  "...de mass rename 500 fichiers et il m'a mass delete mon repo. Merci champion.",
  "...de refactor mon code legacy et il a réécrit toute l'app. En Rust.",
  "...de fix un bug CSS et il a redéployé en prod un vendredi à 18h.",
  "...de m'expliquer mon propre code. J'ai eu une crise existentielle.",
  "...de review ma PR. 47 commentaires. Tous pertinents. Je le déteste.",
  "...de générer des tests et maintenant j'ai 100% coverage et 0% confiance.",
  "...d'optimiser une query SQL. Il a supprimé la table.",
  "...un one-liner et j'ai reçu 200 lignes avec des diagrammes ASCII.",
  "...de debug et il a trouvé le bug en 2 secondes. C'était moi le bug.",
  "...de m'aider avec TypeScript. Ça compile mais je comprends plus rien.",
];

export default function SubmitPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [placeholder] = useState(() =>
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );
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
      setError("T'as rien à raconter ? Retourne sur ChatGPT.");
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
      setError("Erreur de transmission. Réessaie !");
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
        <div className="text-foreground-muted">Connexion au studio...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display neon-cyan mb-2">
        Édition spéciale
      </h1>
      <p className="text-foreground-muted mb-8">
        Aujourd'hui, j'ai demandé à Claude...
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
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
          {isSubmitting ? "Transmission..." : "Diffuser"}
        </button>
      </form>

      <div className="mt-8 p-4 bg-surface/50 border border-border rounded text-sm text-foreground-muted">
        <p className="font-bold text-foreground mb-2">Le règlement intérieur :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>On veut du vécu, pas du ChatGPT</li>
          <li>Pas de pub pour ton SaaS tout pété</li>
          <li>Fais-nous rêver. Ou pleurer. Les deux marchent.</li>
        </ul>
      </div>
    </div>
  );
}
