import Link from "next/link";

export function HeroSection() {
  return (
    <section className="text-center py-16 mb-8">
      <h1 className="text-6xl md:text-8xl font-display glitch-hard neon-cyan mb-6 flex items-center justify-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-16 h-16 md:w-24 md:h-24">
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
