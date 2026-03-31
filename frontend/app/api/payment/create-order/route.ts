import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { insertRow } from "@/lib/supabaseAdmin";
import { checkBuilderPass } from "@/lib/builder-pass/checkPass";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pass = await checkBuilderPass(userId);
    if (pass.active) {
      return NextResponse.json(
        {
          error: "You already have an active Builder Pass",
          expiresAt: pass.expiresAt?.toISOString() ?? null,
        },
        { status: 409 },
      );
    }

    const order = await razorpay.orders.create({
      amount: 15000,
      currency: "INR",
      receipt: `bp_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: userId,
        product: "builder_pass_24h",
      },
    });

    await insertRow("builder_passes", {
      user_id: userId,
      razorpay_order_id: order.id,
      amount_paise: 15000,
      status: "created",
    });

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
