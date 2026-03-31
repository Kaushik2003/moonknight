import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkBuilderPass } from "@/lib/builder-pass/checkPass";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pass = await checkBuilderPass(userId);

    return NextResponse.json({
      active: pass.active,
      expiresAt: pass.expiresAt?.toISOString() ?? null,
    });
  } catch (err: any) {
    console.error("[payment/status] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
