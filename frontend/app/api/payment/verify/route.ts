import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { updateRows } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment fields" },
        { status: 400 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("[verify] Signature mismatch for order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const updatedPasses = await updateRows({
      table: "builder_passes",
      values: {
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        expires_at: expiresAt,
      },
      filters: [
        { column: "razorpay_order_id", value: razorpay_order_id },
        { column: "user_id", value: userId },
      ],
      select: "id",
    });

    if (!updatedPasses[0]) {
      return NextResponse.json(
        { error: "Builder Pass order not found" },
        { status: 404 },
      );
    }

    console.log(
      `[verify] Builder Pass activated for user ${userId}, expires at ${expiresAt}`,
    );

    return NextResponse.json({ success: true, expiresAt });
  } catch (err: any) {
    console.error("[verify] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
