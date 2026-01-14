"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteStoryButtonProps {
  storyId: string;
}

export function DeleteStoryButton({ storyId }: DeleteStoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-neon-orange hover:text-neon-rose transition-colors"
        >
          {isDeleting ? "..." : "Confirmer"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-foreground-muted hover:text-foreground transition-colors"
        >
          Annuler
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-foreground-muted hover:text-neon-orange transition-colors text-xs"
      title="Supprimer"
    >
      Supprimer
    </button>
  );
}
