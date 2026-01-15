import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";

  // Get the real origin
  // In local dev, use the request URL directly
  // In production (behind Koyeb reverse proxy), use forwarded headers
  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");

  let origin: string;
  if (forwardedHost) {
    // Behind reverse proxy (production)
    const protocol = headersList.get("x-forwarded-proto") || "https";
    origin = `${protocol}://${forwardedHost}`;
  } else {
    // Local development or direct access
    origin = requestUrl.origin;
  }

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
