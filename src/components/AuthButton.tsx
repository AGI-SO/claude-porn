"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface Profile {
  username: string;
  avatar_url: string | null;
  role?: string | null;
}

interface AuthButtonProps {
  user: User | null;
  profile: Profile | null;
}

export function AuthButton({ user, profile }: AuthButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (user && profile) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${profile.username}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan text-xs">
              {(profile.username?.[0] || "?").toUpperCase()}
            </div>
          )}
        </Link>
{profile.role === "admin" && (
          <Link
            href="/admin/reports"
            className="text-neon-rose hover:text-neon-orange transition-colors text-sm"
            title="Moderation"
          >
            Admin
          </Link>
        )}
        <Link
          href="/settings/api-keys"
          className="text-foreground-muted hover:text-neon-cyan transition-colors text-sm"
          title="Clés API"
        >
          API
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
