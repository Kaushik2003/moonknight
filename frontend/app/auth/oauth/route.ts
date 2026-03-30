import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  // Resolve the correct public base URL once, used for both success and error redirects
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }

    // Code exchange failed — send the error message to the error page
    const errorUrl = new URL(`${baseUrl}/auth/error`);
    errorUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errorUrl.toString());
  }

  // No code present at all
  const errorUrl = new URL(`${baseUrl}/auth/error`);
  errorUrl.searchParams.set("error", "No authorization code was provided.");
  return NextResponse.redirect(errorUrl.toString());
}
