import Link from "next/link";
import { AuthButton } from "./AuthButton";
import type { User } from "@supabase/supabase-js";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface HeaderProps {
  user: User | null;
  profile: Profile | null;
}

export function Header({ user, profile }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8">
            <g fill="#da7756" transform="translate(32, 48) scale(1.6)">
              <ellipse cx="0" cy="-14" rx="2.5" ry="14"/>
              <ellipse cx="0" cy="-12" rx="2.5" ry="12" transform="rotate(-40)"/>
              <ellipse cx="0" cy="-12" rx="2.5" ry="12" transform="rotate(40)"/>
              <ellipse cx="0" cy="-9" rx="2" ry="9" transform="rotate(-75)"/>
              <ellipse cx="0" cy="-9" rx="2" ry="9" transform="rotate(75)"/>
              <ellipse cx="0" cy="-6" rx="1.5" ry="6" transform="rotate(-120)"/>
              <ellipse cx="0" cy="-6" rx="1.5" ry="6" transform="rotate(120)"/>
              <circle cx="0" cy="0" r="3"/>
            </g>
          </svg>
          <span className="text-2xl font-display glitch-hover neon-cyan">
            Claude Porn
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/submit"
            className="btn-neon text-sm"
          >
            Poster
          </Link>
          <span className="text-foreground-muted">|</span>
          <AuthButton user={user} profile={profile} />
        </nav>
      </div>
    </header>
  );
}
