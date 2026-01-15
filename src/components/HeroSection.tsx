"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
      // Toggle class on body for header visibility
      document.body.classList.toggle("hero-visible", !isScrolled);
    };
    // Set initial state
    document.body.classList.add("hero-visible");
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("hero-visible");
    };
  }, []);

  return (
    <section
      className={`hero-section text-center py-16 mb-8 ${scrolled ? "scrolled" : ""}`}
    >
      <h1 className="text-6xl md:text-8xl font-display glitch-hard neon-cyan mb-6">
        Claude Porn
      </h1>
      <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-8 px-4">
        Maintenant qu'Opus 4.5 est sorti et que tout le monde s'enjaille,
        c'est le moment de partager nos flex, nos tips et nos tricks.
      </p>
      <div className="flex gap-4 justify-center flex-wrap px-4">
        <Link href="/submit" className="btn-neon">
          Poster
        </Link>
        <Link href="/settings/api-keys" className="btn-secondary">
          Installer serveur MCP
        </Link>
      </div>
    </section>
  );
}
