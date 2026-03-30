import { createServerClient } from "@supabase/ssr";

interface PassStatus {
  active: boolean;
  expiresAt: Date | null;
}

/**
 * Server-side only: checks if a user has an active Builder Pass.
 * Uses the Supabase service role key to bypass RLS.
 * Call this from API routes, NOT from client components.
 */
export async function checkBuilderPass(userId: string): Promise<PassStatus> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  const { data, error } = await supabase
    .from("builder_passes")
    .select("expires_at")
    .eq("user_id", userId)
    .eq("status", "paid")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[checkBuilderPass] DB error:", error.message);
    return { active: false, expiresAt: null };
  }

  if (!data) {
    return { active: false, expiresAt: null };
  }

  return { active: true, expiresAt: new Date(data.expires_at) };
}
