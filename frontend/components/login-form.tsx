"use client";

import { SignIn } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none border-0 p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "w-full bg-white text-black font-medium hover:bg-white/90",
            dividerRow: "hidden",
            formFieldRow: "hidden",
            footer: "hidden",
          },
        }}
        routing="hash"
        signUpUrl="/auth/login"
      />
    </div>
  );
}
