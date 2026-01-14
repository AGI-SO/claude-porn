import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Porn - Les dingueries de Claude Code",
  description: "Partage tes exploits avec Claude Code. Vote pour les meilleurs !",
  keywords: ["claude", "ai", "coding", "stories", "programming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${jetbrainsMono.variable} font-mono antialiased scanlines noise`}>
        <Header />
        <main className="min-h-screen pt-20 px-4 pb-8 max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
