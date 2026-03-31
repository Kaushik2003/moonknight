"use client";

import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#1a1030_0%,#0d0815_45%,#07050c_100%)] p-6 md:p-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,96,255,0.2)_0%,rgba(88,45,180,0.12)_28%,rgba(24,14,48,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute left-[42%] top-[44%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(106,189,255,0.12)_0%,rgba(26,64,148,0)_65%)] blur-2xl" />

      <div className="relative w-full max-w-3xl rounded-3xl border border-white/12 bg-[linear-gradient(150deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_35%,rgba(255,255,255,0.02)_100%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)] ring-1 ring-purple-300/15 backdrop-blur-2xl md:p-12">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(120deg,rgba(170,140,255,0.14)_0%,rgba(95,63,168,0.04)_30%,rgba(255,255,255,0)_65%)]" />

        <div className="relative mx-auto w-full max-w-xl space-y-7 text-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              MoonKnight Access
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Sign in to start building private dApps
            </h1>
            <p className="mx-auto max-w-lg text-sm text-white/65 md:text-base">
              Continue to MoonKnight and launch secure Midnight workflows in a streamlined AI-native workspace.
            </p>
          </div>

          <div className="flex justify-center rounded-2xl border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.45)] md:p-6">
            <LoginForm className="w-full max-w-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
