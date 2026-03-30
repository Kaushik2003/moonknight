"use client";

import { useBuilderPassContext } from "@/contexts/BuilderPassContext";

interface UseBuilderPassReturn {
  isActive: boolean;
  expiresAt: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useBuilderPass(): UseBuilderPassReturn {
  return useBuilderPassContext();
}
