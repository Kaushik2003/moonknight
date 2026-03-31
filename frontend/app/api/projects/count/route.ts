import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { countRows } from "@/lib/supabaseAdmin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await countRows("projects", [
      { column: "owner_user_id", value: userId },
    ]);

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to count projects",
      },
      { status: 500 },
    );
  }
}
