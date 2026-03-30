"use client";

import { LoginForm } from "@/components/login-form";
import { LiquidMetalButton } from "@/components/liquid-metal-button";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export default function Page() {
  const { address, status, connect, disconnect, error: walletError } = useWallet();
  const { session } = useSupabaseSession();

  const isConnected = status === "connected" && !!address;
  const isConnecting = status === "connecting";

  const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  const walletLabel = isConnecting
    ? "Connecting..."
    : isConnected
    ? `Connected: ${formatAddress(address!)}`
    : "Connect wallet";

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
      return;
    }
    await connect();
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-background via-background/95 to-background p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Step 1 — Wallet (optional) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Step 1 &middot; Optional
              </p>
              <h2 className="text-xl font-semibold text-white">Connect your wallet</h2>
              <p className="text-sm text-white/70">
                Optionally link your Freighter wallet. You can always do this later from the dashboard.
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                status === "connected"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : status === "connecting"
                  ? "bg-amber-400/20 text-amber-100"
                  : status === "error"
                  ? "bg-red-500/20 text-red-100"
                  : "bg-white/10 text-white/80"
              )}
            >
              {isConnected ? "connected" : "optional"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <LiquidMetalButton label={walletLabel} onClick={handleWalletClick} width={210} />
            {isConnected && (
              <button
                type="button"
                onClick={disconnect}
                className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                Disconnect
              </button>
            )}
          </div>

          {walletError && (
            <p className="mt-3 text-sm text-red-200">
              {walletError}
            </p>
          )}
          {address && (
            <p className="mt-2 text-xs text-white/60">
              Active wallet: {address}
            </p>
          )}
        </div>

        {/* Step 2 — Google login (required, always accessible) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
          <div className="mb-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Step 2 &middot; Required
            </p>
            <h2 className="text-xl font-semibold text-white">Continue with Google</h2>
            <p className="text-sm text-white/70">
              Sign in with Google to finish onboarding and get access to Generate.
            </p>
            {session && (
              <p className="text-xs text-emerald-200">
                You&apos;re already signed in with Google.
              </p>
            )}
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
