"use client";

import { useState, useCallback, useEffect } from "react";

interface Cip30Api {
  getChangeAddress: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  signTx?: (tx: string, partialSign?: boolean) => Promise<string>;
}

interface LaceWalletProvider {
  enable: (options?: { extensions?: Array<{ cip: number }> }) => Promise<Cip30Api>;
  isEnabled: () => Promise<boolean>;
  apiVersion?: string;
  name?: string;
  icon?: string;
}

declare global {
  interface Window {
    cardano?: {
      lace?: LaceWalletProvider;
    };
  }
}

let cachedWalletApi: Cip30Api | null = null;

function getLaceProvider() {
  return window.cardano?.lace;
}

async function enableWallet() {
  if (cachedWalletApi) {
    return cachedWalletApi;
  }

  const provider = getLaceProvider();
  if (!provider) {
    throw new Error(
      "Lace wallet is not installed. Please install the Lace browser extension.",
    );
  }

  cachedWalletApi = await provider.enable();
  return cachedWalletApi;
}

async function getPrimaryAddress(api: Cip30Api) {
  const changeAddress = await api.getChangeAddress().catch(() => "");
  if (changeAddress) {
    return changeAddress;
  }

  const usedAddresses = await api.getUsedAddresses().catch(() => []);
  if (usedAddresses[0]) {
    return usedAddresses[0];
  }

  const unusedAddresses = await api.getUnusedAddresses().catch(() => []);
  if (unusedAddresses[0]) {
    return unusedAddresses[0];
  }

  throw new Error("Lace wallet did not return an address.");
}

const isInstalled = async (): Promise<boolean> => Boolean(getLaceProvider());

const getAddress = async (): Promise<{ address: string }> => {
  const api = await enableWallet();
  const address = await getPrimaryAddress(api);
  return { address };
};

const isAllowed = async (): Promise<boolean> => {
  const provider = getLaceProvider();
  if (!provider) {
    return false;
  }

  return provider.isEnabled();
};

const signTransaction = async (
  tx: string,
  _options: { networkPassphrase: string },
): Promise<{ error?: string; signedTxXdr?: string }> => {
  try {
    const api = await enableWallet();
    if (!api.signTx) {
      return {
        error:
          "Lace wallet is connected, but this app's current signing flow is not supported by the wallet API yet.",
      };
    }

    const signedTx = await api.signTx(tx, true);
    return { signedTxXdr: signedTx };
  } catch (error: any) {
    return {
      error:
        error?.info ||
        error?.message ||
        "Failed to sign transaction with Lace wallet",
    };
  }
};

export type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

export interface UseWalletReturn {
  address: string | null;
  status: WalletStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string, networkPassphrase: string) => Promise<string>;
  error: string | null;
  logs: string[];
  clearLogs: () => void;
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `> ${msg}`]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wasConnected = localStorage.getItem("wallet_connected") === "true";
        if (!wasConnected || !(await isInstalled()) || !(await isAllowed())) {
          return;
        }

        const { address: nextAddress } = await getAddress();
        if (nextAddress) {
          setAddress(nextAddress);
          setStatus("connected");
        }
      } catch (e) {
        console.warn("Auto-connect check failed:", e);
      }
    };

    void checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      if (!(await isInstalled())) {
        const msg =
          "Lace wallet is not installed. Please install the Lace browser extension.";
        setError(msg);
        setStatus("error");
        addLog(`[ERROR] ${msg}`);
        return;
      }

      const { address: walletAddress } = await getAddress();

      setAddress(walletAddress);
      setStatus("connected");
      localStorage.setItem("wallet_connected", "true");
      addLog(
        `[SUCCESS] Wallet Connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
      );
    } catch (e: any) {
      console.error("Wallet connection error:", e);
      const msg =
        e?.info ||
        e?.message ||
        "Failed to connect wallet";
      setError(msg);
      setStatus("error");
      addLog(`[ERROR] Connection failed: ${msg}`);
    }
  }, [addLog]);

  const disconnect = useCallback(() => {
    cachedWalletApi = null;
    setAddress(null);
    setStatus("disconnected");
    setError(null);
    localStorage.removeItem("wallet_connected");
    addLog("Wallet Disconnected");
  }, [addLog]);

  const sign = useCallback(
    async (xdr: string, networkPassphrase: string): Promise<string> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        addLog("Requesting transaction signature...");
        const signed = await signTransaction(xdr, { networkPassphrase });

        if (signed.error || !signed.signedTxXdr) {
          throw new Error(
            signed.error || "Failed to sign transaction with Lace wallet",
          );
        }

        addLog("[SUCCESS] Transaction signed");
        return signed.signedTxXdr;
      } catch (e: any) {
        console.error("Sign error:", e);
        const msg = e.message || "Failed to sign transaction";
        addLog(`[ERROR] Signing failed: ${msg}`);
        throw new Error(msg);
      }
    },
    [address, addLog],
  );

  return {
    address,
    status,
    connect,
    disconnect,
    sign,
    error,
    logs,
    clearLogs,
  };
}
