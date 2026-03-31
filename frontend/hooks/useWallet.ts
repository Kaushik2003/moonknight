"use client";

import { useState, useCallback, useEffect } from 'react';

// Midnight Wallet SDK imports (when packages become available)
// import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
// For now, using stub functions for Lace wallet compatibility

// Stub functions for Lace wallet - replace with actual Midnight SDK when available
const isConnected = async (): Promise<boolean> => {
    // Check if Lace wallet extension is installed
    // Placeholder for actual implementation
    return false;
};

const setAllowed = async (): Promise<void> => {
    // Request permission from Lace wallet
    // Placeholder for actual implementation
};

const getAddress = async (): Promise<{ address: string }> => {
    // Get the active address from Lace wallet
    // Placeholder for actual implementation
    return { address: "" };
};

const isAllowed = async (): Promise<boolean> => {
    // Check if Lace wallet has given permission
    // Placeholder for actual implementation
    return false;
};

const signTransaction = async (xdr: string, options: { networkPassphrase: string }): Promise<{ error?: string; signedTxXdr?: string }> => {
    // Sign transaction using Lace wallet
    // Placeholder for actual implementation
    return { error: "Lace wallet integration pending" };
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
        setLogs(prev => [...prev, `> ${msg}`]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    // Auto-connect on mount if allowed and previously connected
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const wasConnected = localStorage.getItem("wallet_connected") === "true";
                if (wasConnected && await isConnected() && await isAllowed()) {
                    const { address } = await getAddress();
                    if (address) {
                        setAddress(address);
                        setStatus("connected");
                    }
                }
            } catch (e) {
                console.warn("Auto-connect check failed:", e);
            }
        };
        checkConnection();
    }, []);

    const connect = useCallback(async () => {
        setError(null);
        setStatus("connecting");

        try {
            const installed = await isConnected();
            if (!installed) {
                const msg = "Lace wallet is not installed. Please install the Lace browser extension.";
                setError(msg);
                setStatus("error");
                addLog(`[ERROR] ${msg}`);
                return;
            }

            await setAllowed();
            const { address: walletAddress } = await getAddress();

            setAddress(walletAddress);
            setStatus("connected");
            localStorage.setItem("wallet_connected", "true");
            addLog(`[SUCCESS] Wallet Connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`);
        } catch (e: any) {
            console.error("Wallet connection error:", e);
            const msg = e.message || "Failed to connect wallet";
            setError(msg);
            setStatus("error");
            addLog(`[ERROR] Connection failed: ${msg}`);
        }
    }, [addLog]);

    const disconnect = useCallback(() => {
        setAddress(null);
        setStatus("disconnected");
        setError(null);
        localStorage.removeItem("wallet_connected");
        addLog("Wallet Disconnected");
    }, [addLog]);

    const sign = useCallback(async (xdr: string, networkPassphrase: string): Promise<string> => {
        if (!address) {
            throw new Error("Wallet not connected");
        }

        try {
            addLog("Requesting transaction signature...");
            const signed = await signTransaction(xdr, { networkPassphrase });

            if (signed.error) {
                throw new Error(signed.error);
            }

            addLog("[SUCCESS] Transaction signed");
            return signed.signedTxXdr;
        } catch (e: any) {
            console.error("Sign error:", e);
            const msg = e.message || "Failed to sign transaction";
            addLog(`[ERROR] Signing failed: ${msg}`);
            throw new Error(msg);
        }
    }, [address, addLog]);

    return {
        address,
        status,
        connect,
        disconnect,
        sign,
        error,
        logs,
        clearLogs
    };
}