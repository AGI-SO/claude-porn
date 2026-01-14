import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminReportCard } from "@/components/AdminReportCard";
import type { ReportWithDetails } from "@/lib/types";

export default async function AdminReportsPage() {
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

  // Fetch reports with story and reporter details
  const { data: reports } = await supabase
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

  const reportsWithDetails = (reports || []) as unknown as ReportWithDetails[];

  return (
    <div>
      <h1 className="text-3xl font-display neon-cyan mb-8">
        Moderation - Reports
      </h1>

      {reportsWithDetails.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-foreground-muted text-lg">
            Aucun report en attente
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reportsWithDetails.map((report) => (
            <AdminReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
