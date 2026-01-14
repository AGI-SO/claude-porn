"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${user.user_metadata.preferred_username || user.user_metadata.user_name || user.email?.split("@")[0]}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {user.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan text-xs">
              {(user.email?.[0] || "?").toUpperCase()}
            </div>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className="text-foreground-muted hover:text-neon-orange transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="btn-neon text-sm">
      Login
    </Link>
  );
}
