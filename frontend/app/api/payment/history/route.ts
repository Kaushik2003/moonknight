import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { selectRows } from "@/lib/supabaseAdmin";

interface BuilderPassHistoryRow {
  id: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  amount_paise: number;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await selectRows<BuilderPassHistoryRow>({
      table: "builder_passes",
      select: "id, status, expires_at, created_at, amount_paise",
      filters: [
        { column: "user_id", value: userId },
        { column: "status", value: "paid" },
      ],
      orderBy: { column: "created_at", ascending: false },
      limit: 10,
    });

    return NextResponse.json({ history: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load history",
      },
      { status: 500 },
    );
  }
}
