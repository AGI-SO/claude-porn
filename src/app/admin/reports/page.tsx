import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminReportCard } from "@/components/AdminReportCard";
import { AdminCommentReportCard } from "@/components/AdminCommentReportCard";
import type { ReportWithDetails, CommentReportWithDetails } from "@/lib/types";
import Link from "next/link";

interface AdminReportsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const { tab = "stories" } = await searchParams;
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?redirectTo=/admin/reports");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Fetch story reports or comment reports based on tab
  let storyReports: ReportWithDetails[] = [];
  let commentReports: CommentReportWithDetails[] = [];

  if (tab === "comments") {
    const { data } = await supabase
      .from("comment_reports")
      .select(`
        *,
        comments (
          id,
          content,
          created_at,
          story_id
        ),
        reporter:profiles!comment_reports_reporter_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    commentReports = (data || []) as unknown as CommentReportWithDetails[];
  } else {
    const { data } = await supabase
      .from("reports")
      .select(`
        *,
        stories (
          id,
          content,
          created_at,
          score,
          user_id
        ),
        reporter:profiles!reports_reporter_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    storyReports = (data || []) as unknown as ReportWithDetails[];
  }

  return (
    <div>
      <h1 className="text-3xl font-display neon-cyan mb-6">
        Moderation - Reports
      </h1>

      {/* Tabs */}
      <nav className="flex gap-2 mb-8">
        <Link
          href="/admin/reports?tab=stories"
          className={`px-4 py-2 rounded text-sm transition-all ${
            tab === "stories"
              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan"
              : "text-foreground-muted hover:text-foreground border border-transparent"
          }`}
        >
          Stories
        </Link>
        <Link
          href="/admin/reports?tab=comments"
          className={`px-4 py-2 rounded text-sm transition-all ${
            tab === "comments"
              ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan"
              : "text-foreground-muted hover:text-foreground border border-transparent"
          }`}
        >
          Comments
        </Link>
      </nav>

      {/* Content */}
      {tab === "comments" ? (
        commentReports.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-foreground-muted text-lg">
              Aucun report de commentaire en attente
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {commentReports.map((report) => (
              <AdminCommentReportCard key={report.id} report={report} />
            ))}
          </div>
        )
      ) : (
        storyReports.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-foreground-muted text-lg">
              Aucun report de story en attente
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {storyReports.map((report) => (
              <AdminReportCard key={report.id} report={report} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
