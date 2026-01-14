import Link from "next/link";
import { AuthButton } from "./AuthButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-display glitch-hover neon-cyan">
            Claude Porn
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/submit"
            className="btn-neon text-sm"
          >
            + Poster
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
