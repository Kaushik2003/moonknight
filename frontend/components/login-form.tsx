"use client";

import { SignIn } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex w-full flex-col items-center gap-6", className)} {...props}>
      <SignIn
        appearance={{
          elements: {
            rootBox: "flex w-full justify-center",
            card: "bg-transparent shadow-none border-0 p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "h-11 w-full rounded-xl border border-white/15 bg-white/6 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-white/25 hover:bg-white/10",
            socialButtonsBlockButtonText: "text-white",
            socialButtonsProviderIcon: "brightness-110 saturate-110",
            socialButtonsIconButton: "rounded-lg border border-white/10 bg-white/5 text-white",
            socialButtonsBlockButtonArrow: "text-white/70",
            socialButtonsBlockButton__google: "bg-white/8",
            dividerRow: "hidden",
            formFieldRow: "hidden",
            footer: "hidden",
          },
        }}
        routing="hash"
        signUpUrl="/auth/login"
        fallbackRedirectUrl="/generate"
        forceRedirectUrl="/generate"
      />
    </div>
  );
}
