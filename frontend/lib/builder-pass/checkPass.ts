import { selectRows } from "@/lib/supabaseAdmin";

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
  try {
    const { data } = await selectRows<{ expires_at: string }>({
      table: "builder_passes",
      select: "expires_at",
      filters: [
        { column: "user_id", value: userId },
        { column: "status", value: "paid" },
        {
          column: "expires_at",
          operator: "gt",
          value: new Date().toISOString(),
        },
      ],
      orderBy: { column: "expires_at", ascending: false },
      limit: 1,
    });

    if (!data[0]) {
      return { active: false, expiresAt: null };
    }

    return { active: true, expiresAt: new Date(data[0].expires_at) };
  } catch (error) {
    console.error(
      "[checkBuilderPass] DB error:",
      error instanceof Error ? error.message : error,
    );
    return { active: false, expiresAt: null };
  }
}
