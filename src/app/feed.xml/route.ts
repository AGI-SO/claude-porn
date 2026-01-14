import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SITE_URL = "https://claude-porn.fr";

export async function GET() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      profiles!stories_user_id_fkey (
        username
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const rss = generateRSSFeed(stories || []);

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRSSFeed(stories: any[]): string {
  const items = stories
    .map((story) => {
      const title = `${story.profiles.username} - Score: ${story.score}`;
      const description = escapeXml(story.content);
      const pubDate = new Date(story.created_at).toUTCString();
      const link = `${SITE_URL}/u/${story.profiles.username}#${story.id}`;
      const guid = story.id;

      return `    <item>
      <title>${escapeXml(title)}</title>
      <description><![CDATA[${story.content}]]></description>
      <pubDate>${pubDate}</pubDate>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Claude Porn - Les dingueries de Claude Code</title>
    <link>${SITE_URL}</link>
    <description>Partage tes exploits avec Claude Code. Vote pour les meilleurs !</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
