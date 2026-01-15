"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (user && profile) {
    return (
      <div className="flex items-center gap-3">
        {profile.role === "admin" && (
          <>
            <Link
              href="/admin/reports"
              className="text-neon-rose hover:text-neon-orange transition-colors text-sm"
              title="Moderation"
            >
              Admin
            </Link>
            <span className="text-foreground-muted">|</span>
          </>
        )}
        <Link
          href="/settings/api-keys"
          className="text-foreground-muted hover:text-neon-cyan transition-colors text-sm"
          title="Clés API"
        >
          Serveur MCP
        </Link>
        <span className="text-foreground-muted">|</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
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
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded shadow-lg z-50">
              <Link
                href={`/u/${profile.username}`}
                className="block px-4 py-2 text-sm text-foreground hover:bg-background transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                Profil
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-neon-orange hover:bg-background transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="btn-neon text-sm">
      Login
    </Link>
  );
}
