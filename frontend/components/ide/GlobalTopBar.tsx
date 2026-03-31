"use client";
import { cn } from "@/lib/utils";
import {
  Cuboid,
  LayoutTemplate,
  Wallet,
  LogOut,
  HelpCircle,
  Save,
  Folder,
  Loader2,
} from "lucide-react";
import { IdeMode } from "@/types/ide";
import { useState } from "react";
import { WalletGuidePopup } from "./WalletGuidePopup";
import Link from "next/link";
import { BuilderPassButton } from "@/components/builder-pass/BuilderPassButton";
import { PricingModal } from "./PricingModal";
import { useBuilderPass } from "@/hooks/useBuilderPass";

type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

interface GlobalTopBarProps {
  ideMode: IdeMode;
  onIdeModeChange: (mode: IdeMode) => void;
  walletAddress?: string | null;
  walletStatus?: WalletStatus;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  // Projects
  currentProjectName?: string | null;
  currentProjectId?: string | null;
  onSaveProject?: () => void;
  onOpenProjects?: () => void;
  isSaving?: boolean;
}

export function GlobalTopBar({
  ideMode,
  onIdeModeChange,
  walletAddress,
  walletStatus = "disconnected",
  onConnectWallet,
  onDisconnectWallet,
  currentProjectName,
  currentProjectId,
  onSaveProject,
  onOpenProjects,
  isSaving = false,
}: GlobalTopBarProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const { isActive: isPassActive } = useBuilderPass();

  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null;

  const isConnected = walletStatus === "connected" && walletAddress;
  const isConnecting = walletStatus === "connecting";

  return (
    <div className="h-12 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 shrink-0 select-none">
      {/* Left - Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-zinc-100 font-bold tracking-tight w-40 hover:opacity-90 transition-opacity"
      >
        <img src="/logoremove.png" alt="MoonKnight" className="w-10 h-10 rounded-md" />
        <span className="text-sm">MoonKnight</span>
      </Link>

      {/* Center - Mode Toggle */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => onIdeModeChange("contract")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
              ideMode === "contract"
                ? "bg-zinc-800 text-purple-400 shadow-sm ring-1 ring-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            )}
          >
            <Cuboid className="w-3.5 h-3.5" />
            Smart Contract
          </button>
          <button
            onClick={() => onIdeModeChange("frontend")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
              ideMode === "frontend"
                ? "bg-zinc-800 text-purple-400 shadow-sm ring-1 ring-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            )}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Frontend
          </button>
        </div>
      </div>

      {/* Right - Project + Wallet Controls */}
      <div className="flex items-center gap-3 w-50 justify-end">
        {/* Current Project */}
        <div
          className={cn(
            "hidden md:flex items-center gap-2 px-3 h-9 rounded-full border text-[11px] font-medium transition-all",
            currentProjectId
              ? "border-white/15 bg-zinc-950/40 text-zinc-100 shadow-[0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_55%)]"
              : "border-white/10 bg-zinc-950/20 text-zinc-300/70 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_55%)]",
          )}
          title={currentProjectId ? "Current project" : "Unsaved project"}
        >
          <span
            className={cn(
              "flex h-2.5 w-2.5 rounded-full border",
              currentProjectId
                ? "border-white/70 bg-white/15 shadow-[0_0_0_2px_rgba(255,255,255,0.06)]"
                : "border-white/25 bg-white/5",
            )}
          />
          <span className="truncate max-w-[160px] text-[11px] tracking-wide text-zinc-100">
            {currentProjectName || "Unsaved"}
          </span>
          <span className="text-zinc-500/70">•</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400/80">
            {currentProjectId ? "LIVE" : "DRAFT"}
          </span>
        </div>

        {/* Save / Projects */}
        <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
          <button
            onClick={() => onSaveProject?.()}
            disabled={isSaving}
            className={cn(
              "h-8 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5",
              isSaving
                ? "text-zinc-500 cursor-wait"
                : "text-zinc-200 hover:text-white hover:border-purple-700/60 hover:bg-purple-950/40",
            )}
            title={currentProjectId ? "Update save" : "Save project"}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className={cn("w-3.5 h-3.5", currentProjectId && "text-purple-400")}/>
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => onOpenProjects?.()}
            className="h-8 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 text-zinc-200 hover:text-white hover:border-purple-700/60 hover:bg-purple-950/40"
            title="My projects"
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projects</span>
          </button>
        </div>

        {/* Builder Pass */}
        <BuilderPassButton onClickOverride={isPassActive ? undefined : () => setIsPricingModalOpen(true)} />

        {/* Wallet */}
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="h-8 px-3 rounded-md bg-green-900/30 border border-green-800/50 text-green-400 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {displayAddress}
            </span>
            <button
              onClick={onDisconnectWallet}
              className="h-8 px-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-800/50 transition-colors flex items-center"
              title="Disconnect wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="h-8 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-purple-400 hover:border-purple-800/50 transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs font-medium"
              title="Need help installing a wallet?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>No wallet?</span>
            </button>
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className={cn(
                "h-8 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                isConnecting
                  ? "text-zinc-500 cursor-wait"
                  : "text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
              )}
            >
              <Wallet className="w-3.5 h-3.5" />
              {isConnecting ? "Connecting..." : "Connect wallet"}
            </button>
          </div>
        )}
      </div>

      {/* Wallet Guide Popup */}
      <WalletGuidePopup isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Pricing Modal */}
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </div>
  );
}
