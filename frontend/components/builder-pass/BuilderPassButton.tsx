"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useBuilderPass } from "@/hooks/useBuilderPass";
import { Zap, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function formatTimeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function BuilderPassButton({
  onClickOverride,
}: {
  onClickOverride?: () => void;
}) {
  const { isActive, expiresAt, isLoading, refresh } = useBuilderPass();
  const [paying, setPaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Update countdown every 30 seconds
  useEffect(() => {
    if (!isActive || !expiresAt) return;
    const update = () => setTimeLeft(formatTimeRemaining(expiresAt));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [isActive, expiresAt]);

  async function handlePurchase() {
    if (paying) return;
    setPaying(true);

    try {
      const res = await fetch("/api/payment/create-order", { method: "POST" });

      if (res.status === 409) {
        toast.info("You already have an active Builder Pass!");
        await refresh();
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to create order");
        return;
      }

      const { orderId, amount, currency, keyId } = await res.json();

      const options = {
        key: keyId,
        amount,
        currency,
        name: "MoonKnight",
        description: "Builder Pass — 24h AI Access",
        order_id: orderId,
        theme: { color: "#7c3aed" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Builder Pass activated! You have 24h of AI access. 🚀");
            await refresh();
          } else {
            const err = await verifyRes.json();
            toast.error(err.error ?? "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error("[BuilderPassButton] Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      if (!isActive) setPaying(false);
    }
  }

  // Loading state — matches the bar's compact button style
  if (isLoading) {
    return (
      <div className="h-8 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-medium flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Pass…</span>
      </div>
    );
  }

  // Active state — compact green pill matching the connected-wallet style
  if (isActive && expiresAt) {
    return (
      <div
        className="h-8 px-2.5 rounded-md bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
        title={`Builder Pass active — expires in ${timeLeft}`}
      >
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Builder's Pass</span>
        <span className="flex items-center gap-0.5 text-emerald-500/80">
          <Clock className="w-3 h-3" />
          {timeLeft}
        </span>
      </div>
    );
  }

  // Purchase state — compact button matching Save/Projects style
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        onClick={onClickOverride || handlePurchase}
        disabled={paying}
        className="h-8 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap text-violet-300 hover:text-violet-100 hover:border-violet-700/60 hover:bg-violet-950/40 disabled:cursor-not-allowed disabled:opacity-50"
        title="Get Builder Pass — 24h AI access for ₹150"
      >
        {paying ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">
          {paying ? "Opening…" : "Builder Pass"}
        </span>
        {!paying && (
          <span className="text-violet-400/60 text-[10px]">₹150</span>
        )}
      </button>
    </>
  );
}
