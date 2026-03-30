import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkBuilderPass } from "@/lib/builder-pass/checkPass";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pass = await checkBuilderPass(user.id);

    return NextResponse.json({
      active: pass.active,
      expiresAt: pass.expiresAt?.toISOString() ?? null,
    });
  } catch (err: any) {
    console.error("[payment/status] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
