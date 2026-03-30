import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    // 2. Check if user already has an active pass
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: existing } = await adminSupabase
      .from("builder_passes")
      .select("expires_at")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active Builder Pass", expiresAt: existing.expires_at },
        { status: 409 }
      );
    }

    // 3. Create Razorpay order — ₹150 = 15000 paise
    const order = await razorpay.orders.create({
      amount: 15000,
      currency: "INR",
      receipt: `bp_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        email: user.email ?? "",
        product: "builder_pass_24h",
      },
    });

    // 4. Store the pending order in DB
    const { error: dbError } = await adminSupabase
      .from("builder_passes")
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount_paise: 15000,
        status: "created",
      });

    if (dbError) {
      console.error("[create-order] DB insert error:", dbError.message);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("[create-order] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
