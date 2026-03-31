"use client";

import { useUser } from "@clerk/nextjs";

interface ClerkUserSession {
  id: string;
  email: string | undefined;
  name: string | undefined;
  imageUrl: string | undefined;
}

interface ClerkSessionState {
  session: { userId: string } | null;
  user: ClerkUserSession | null;
  loading: boolean;
}

export function useClerkSession(): ClerkSessionState {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return { session: null, user: null, loading: true };
  }

  if (!user) {
    return { session: null, user: null, loading: false };
  }

  return {
    session: { userId: user.id },
    user: {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl,
    },
    loading: false,
  };
}
