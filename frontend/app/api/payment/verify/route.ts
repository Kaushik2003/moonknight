import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment fields" },
        { status: 400 }
      );
    }

    // 3. Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("[verify] Signature mismatch for order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 4. Activate pass: set expires_at = now + 24h, update status
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await adminSupabase
      .from("builder_passes")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        expires_at: expiresAt,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[verify] DB update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to activate pass" },
        { status: 500 }
      );
    }

    console.log(
      `[verify] Builder Pass activated for user ${user.id}, expires at ${expiresAt}`
    );

    return NextResponse.json({ success: true, expiresAt });
  } catch (err: any) {
    console.error("[verify] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
