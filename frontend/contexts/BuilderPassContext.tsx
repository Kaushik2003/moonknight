"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface PassStatus {
  active: boolean;
  expiresAt: string | null;
}

interface BuilderPassContextValue {
  isActive: boolean;
  expiresAt: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const BuilderPassContext = createContext<BuilderPassContextValue | undefined>(undefined);

export function BuilderPassProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PassStatus>({ active: false, expiresAt: null });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payment/status");
      if (res.ok) {
        const data = await res.json();
        setStatus({ active: data.active, expiresAt: data.expiresAt });
      }
    } catch (err) {
      console.error("[BuilderPassContext] Failed to fetch status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: BuilderPassContextValue = {
    isActive: status.active,
    expiresAt: status.expiresAt,
    isLoading,
    refresh,
  };

  return (
    <BuilderPassContext.Provider value={value}>
      {children}
    </BuilderPassContext.Provider>
  );
}

export function useBuilderPassContext(): BuilderPassContextValue {
  const context = useContext(BuilderPassContext);
  if (context === undefined) {
    throw new Error("useBuilderPassContext must be used within a BuilderPassProvider");
  }
  return context;
}
