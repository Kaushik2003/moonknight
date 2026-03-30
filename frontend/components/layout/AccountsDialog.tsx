"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Copy, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  MONACO_THEME_CHANGE_EVENT,
  MONACO_THEME_LABELS,
  MONACO_THEME_OPTIONS,
  MonacoThemeName,
  getStoredMonacoTheme,
  setStoredMonacoTheme,
} from "@/lib/monacoTheme";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { createClient } from "@/utils/supabase/client";
import { useBuilderPass } from "@/hooks/useBuilderPass";
import { CheckCircle, Zap, Shield, Clock, HelpCircle, AlertCircle } from "lucide-react";

type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

export default function AccountsDialog({
  isOpen,
  onClose,
  onDisconnectWallet,
  walletAddress,
  walletStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDisconnectWallet?: () => void;
  walletAddress?: string | null;
  walletStatus?: WalletStatus;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { session, user, loading: sessionLoading } = useSupabaseSession();
  const [selectedMonacoTheme, setSelectedMonacoTheme] =
    useState<MonacoThemeName>("v0-dark");

  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [projectsCountLoading, setProjectsCountLoading] = useState(false);
  const [projectsCountError, setProjectsCountError] = useState<string | null>(
    null,
  );

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState(false);

  const { isActive, expiresAt, isLoading: isPassLoading, refresh: refreshPass } = useBuilderPass();
  const [passHistory, setPassHistory] = useState<any[]>([]);
  const [passHistoryLoading, setPassHistoryLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMonacoTheme(getStoredMonacoTheme());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setProjectsCount(null);
    setProjectsCountError(null);

    if (!session) return;

    let isCancelled = false;
    setProjectsCountLoading(true);

    (async () => {
      try {
        const { count, error } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        if (!isCancelled) setProjectsCount(count ?? 0);
      } catch (err: any) {
        if (!isCancelled) {
          setProjectsCountError(err?.message || "Failed to load projects count");
        }
      } finally {
        if (!isCancelled) setProjectsCountLoading(false);
      }
    })();

    setPassHistoryLoading(true);
    refreshPass();
    (async () => {
      try {
        const { data, error } = await supabase
          .from("builder_passes")
          .select("id, status, expires_at, created_at, amount_paise")
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        if (!isCancelled && data) setPassHistory(data);
      } catch (err: any) {
        console.error("Failed to load pass history", err);
      } finally {
        if (!isCancelled) setPassHistoryLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, session, supabase]);

  const handleSave = () => {
    setStoredMonacoTheme(selectedMonacoTheme);

    window.dispatchEvent(
      new CustomEvent(MONACO_THEME_CHANGE_EVENT, {
        detail: { theme: selectedMonacoTheme },
      }),
    );

    onClose();
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User";
  const accountTitle = sessionLoading
    ? "Loading..."
    : session
      ? displayName
      : "Not signed in";
  const accountSubtitle = sessionLoading
    ? "Checking session…"
    : user?.email
      ? user.email
      : session
        ? "Signed in"
        : "Sign in to manage your projects";
  const userInitial = displayName?.charAt(0)?.toUpperCase() || "U";

  const shortUserId = user?.id
    ? `${user.id.slice(0, 8)}…${user.id.slice(-4)}`
    : null;

  const walletLabel = walletStatus
    ? walletStatus === "connected"
      ? walletAddress
        ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
        : "Connected"
      : walletStatus
    : null;

  const handleCopyUserId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedUserId(true);
      window.setTimeout(() => setCopiedUserId(false), 1200);
    } catch {
      // fallback: do nothing (clipboard can fail in some browser contexts)
    }
  };

  const handleLogout = async () => {
    if (!session) return;
    if (!confirm("Log out of your Supabase account?")) return;

    setIsSigningOut(true);
    setSignOutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onDisconnectWallet?.();
      onClose();
      router.push("/");
    } catch (err: any) {
      setSignOutError(err?.message || "Failed to log out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[850px] bg-zinc-900 border-zinc-800 text-zinc-100 flex flex-col md:flex-row p-0 overflow-hidden gap-0">
        
        {/* Left column: Account & Settings */}
        <div className="flex-1 p-6 flex flex-col h-full max-h-[80vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold">Account &amp; Settings</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Manage your Supabase account and IDE preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 flex-1">
            {/* Account */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Account
            </h3>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`${displayName} avatar`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-zinc-200">
                        {userInitial}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">
                      {accountTitle}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {accountSubtitle}
                    </p>
                  </div>
                </div>

                {session ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isSigningOut}
                    className="h-8"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>Log out</span>
                  </Button>
                ) : (
                  <Button asChild size="sm" className="h-8 bg-purple-600 hover:bg-purple-500 text-white">
                    <Link href="/auth/login?next=/generate">Sign in</Link>
                  </Button>
                )}
              </div>

              {signOutError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {signOutError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Saved projects
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {projectsCountLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                        <span className="text-sm text-zinc-300">Loading</span>
                      </>
                    ) : projectsCountError ? (
                      <span className="text-sm text-red-400">Error</span>
                    ) : (
                      <span className="text-sm font-semibold text-zinc-100">
                        {projectsCount ?? "—"}
                      </span>
                    )}
                  </div>
                  {projectsCountError && (
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {projectsCountError}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Wallet
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-zinc-500" />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        walletStatus === "connected"
                          ? "text-emerald-300"
                          : "text-zinc-300",
                      )}
                    >
                      {walletLabel ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {user?.id && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      User ID
                    </p>
                    <p className="text-xs text-zinc-200 font-mono truncate">
                      {shortUserId}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyUserId}
                    className="h-8"
                    disabled={copiedUserId}
                    title="Copy user id"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedUserId ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Settings
            </h3>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Editor
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Font Size</p>
                    <p className="text-xs text-zinc-500">
                      Editor font size in pixels
                    </p>
                  </div>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300">
                    <option>12px</option>
                    <option>13px</option>
                    <option>14px</option>
                    <option>16px</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Tab Size</p>
                    <p className="text-xs text-zinc-500">Spaces per tab</p>
                  </div>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300">
                    <option>2</option>
                    <option>4</option>
                    <option>8</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                AI Assistant
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Default Model</p>
                    <p className="text-xs text-zinc-500">
                      Preferred AI model
                    </p>
                  </div>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300">
                    <option>Gemini Pro</option>
                    <option>Claude Sonnet</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Auto-complete</p>
                    <p className="text-xs text-zinc-500">
                      Enable AI code suggestions
                    </p>
                  </div>
                  <button className="w-10 h-5 bg-purple-600 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Appearance
                </h4>
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Editor Theme</p>
                    <p className="text-xs text-zinc-500">
                      Monaco editor color scheme
                    </p>
                  </div>
                  <select
                    className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
                    value={selectedMonacoTheme}
                    onChange={(e) =>
                      setSelectedMonacoTheme(e.target.value as MonacoThemeName)
                    }
                  >
                    {MONACO_THEME_OPTIONS.map((theme) => (
                      <option key={theme} value={theme}>
                        {MONACO_THEME_LABELS[theme]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-end gap-2 border-t border-zinc-800 pt-6">
              <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Right column: Subscription & History */}
        <div className="w-full md:w-[320px] bg-zinc-950/50 border-t md:border-t-0 md:border-l border-zinc-800 p-6 flex flex-col max-h-[80vh]">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-400" /> Subscription
          </h3>

          {/* Status Panel */}
          {isPassLoading ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching status...
            </div>
          ) : isActive ? (
            <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-4 mb-6 shadow-sm shadow-emerald-900/10">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                 <CheckCircle className="w-5 h-5" /> Active Pass
              </div>
              <p className="text-xs text-emerald-200/70 mb-3 leading-relaxed">
                You have full access to premium AI models like GPT-4o and Claude 3.5 Sonnet.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500/90 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Expires {expiresAt ? new Date(expiresAt).toLocaleString() : ""}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 text-zinc-100 font-semibold mb-2 relative z-10">
                 <Zap className="w-5 h-5 text-purple-400" /> Free Mode
              </div>
              <p className="text-xs text-zinc-400 relative z-10 leading-relaxed mb-4">
                Upgrade to unlock the most powerful reasoning models for 24 hours.
              </p>
            </div>
          )}

          {/* History */}
          <div className="flex flex-col flex-1 min-h-0">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Purchase History
            </h4>
            
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
              {passHistoryLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                </div>
              ) : passHistory.length > 0 ? (
                passHistory.map(pass => (
                  <div key={pass.id} className="flex flex-col p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-sm space-y-1.5 hover:bg-zinc-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-200 font-medium">₹{(pass.amount_paise / 100).toFixed(0)}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-semibold">Paid</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{new Date(pass.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24h</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border border-zinc-800 border-dashed bg-zinc-900/20">
                  <Shield className="w-8 h-8 text-zinc-700 mb-2" />
                  <p className="text-sm text-zinc-500 font-medium">No active or past purchases</p>
                  <p className="text-xs text-zinc-600 mt-1">Your builder pass history will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
