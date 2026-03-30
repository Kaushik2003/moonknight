"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ── Signal types (mirrors shared/agent-signals.ts) ─────────────────────

const AGENT_SIGNAL_TYPES = new Set([
  "agent.idle",
  "agent.thinking",
  "agent.tool_call",
  "agent.tool_result",
  "agent.retry",
  "agent.stream_chunk",
  "agent.done",
  "agent.error",
  "sandbox.starting",
  "sandbox.ready",
  "sandbox.crashed",
]);

export function isAgentSignal(msg: unknown): msg is AgentSignal {
  if (typeof msg !== "object" || msg === null) return false;
  return AGENT_SIGNAL_TYPES.has((msg as { type?: string }).type ?? "");
}

export interface AgentFileChange {
  path: string;
  operation: "write" | "delete";
  content?: string;
}

export interface AgentTokenUsage {
  input: number;
  output: number;
  cost_usd: number;
}

export type AgentSignal =
  | { type: "agent.idle" }
  | { type: "agent.thinking"; phase: "planning" | "executing" | "validating" | "retrying" }
  | { type: "agent.tool_call"; tool: string; args: Record<string, unknown>; iteration: number }
  | { type: "agent.tool_result"; tool: string; success: boolean; duration_ms: number }
  | { type: "agent.retry"; attempt: number; reason: string; failure_type: string }
  | { type: "agent.stream_chunk"; content: string }
  | { type: "agent.done"; message: string; file_changes: AgentFileChange[]; model: string; tokens: AgentTokenUsage }
  | { type: "agent.error"; message: string; code: string; recoverable: boolean }
  | { type: "sandbox.starting" }
  | { type: "sandbox.ready" }
  | { type: "sandbox.crashed"; reason: string };

// ── State types ────────────────────────────────────────────────────────

export type AgentStatus =
  | "idle"
  | "thinking"
  | "executing"
  | "validating"
  | "retrying"
  | "error"
  | "done";

export interface AgentState {
  status: AgentStatus;
  currentTool: string | null;
  currentFile: string | null;
  retryCount: number;
  maxRetries: number;
  retryReason: string | null;
  tokenUsage: AgentTokenUsage | null;
  model: string | null;
  lastError: { message: string; code: string; recoverable: boolean } | null;
  isLoading: boolean;
}

const INITIAL_STATE: AgentState = {
  status: "idle",
  currentTool: null,
  currentFile: null,
  retryCount: 0,
  maxRetries: 3,
  retryReason: null,
  tokenUsage: null,
  model: null,
  lastError: null,
  isLoading: false,
};

// ── Hook ───────────────────────────────────────────────────────────────

export function useAgentState() {
  const [state, setState] = useState<AgentState>(INITIAL_STATE);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending done→idle timer
  const clearDoneTimer = useCallback(() => {
    if (doneTimerRef.current) {
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  }, []);

  const processSignal = useCallback(
    (signal: AgentSignal) => {
      clearDoneTimer();

      switch (signal.type) {
        case "agent.idle":
          setState((prev) => ({
            ...prev,
            status: "idle",
            currentTool: null,
            currentFile: null,
            retryCount: 0,
            retryReason: null,
            isLoading: false,
          }));
          break;

        case "agent.thinking":
          setState((prev) => ({
            ...prev,
            status: signal.phase === "retrying" ? "retrying" : signal.phase === "validating" ? "validating" : "thinking",
            currentTool: null,
            currentFile: null,
            isLoading: true,
          }));
          break;

        case "agent.tool_call":
          setState((prev) => ({
            ...prev,
            status: "executing",
            currentTool: signal.tool,
            currentFile: (signal.args?.path as string) ?? null,
            isLoading: true,
          }));
          break;

        case "agent.tool_result":
          // Stay in executing state — next tool_call or thinking signal will update
          break;

        case "agent.retry":
          setState((prev) => ({
            ...prev,
            status: "retrying",
            retryCount: signal.attempt,
            retryReason: signal.reason,
            isLoading: true,
          }));
          break;

        case "agent.stream_chunk":
          // No state change needed — the chunk content is handled elsewhere
          break;

        case "agent.done":
          setState((prev) => ({
            ...prev,
            status: "done",
            currentTool: null,
            currentFile: null,
            tokenUsage: signal.tokens,
            model: signal.model,
            isLoading: false,
          }));
          // Auto-reset to idle after 3 seconds
          doneTimerRef.current = setTimeout(() => {
            setState((prev) =>
              prev.status === "done"
                ? { ...prev, status: "idle", tokenUsage: null }
                : prev,
            );
          }, 3000);
          break;

        case "agent.error":
          setState((prev) => ({
            ...prev,
            status: "error",
            currentTool: null,
            currentFile: null,
            lastError: {
              message: signal.message,
              code: signal.code,
              recoverable: signal.recoverable,
            },
            isLoading: false,
          }));
          break;

        case "sandbox.starting":
          // Optional: could show a "sandbox starting" state
          break;

        case "sandbox.ready":
          // Reset to idle when sandbox comes online
          setState((prev) => ({
            ...prev,
            status: "idle",
            lastError: null,
            isLoading: false,
          }));
          break;

        case "sandbox.crashed":
          setState((prev) => ({
            ...prev,
            status: "error",
            lastError: {
              message: signal.reason,
              code: "SANDBOX_CRASHED",
              recoverable: true,
            },
            isLoading: false,
          }));
          break;
      }
    },
    [clearDoneTimer],
  );

  const reset = useCallback(() => {
    clearDoneTimer();
    setState(INITIAL_STATE);
  }, [clearDoneTimer]);

  // Set error directly (for disconnect events)
  const setDisconnected = useCallback(
    (message: string) => {
      clearDoneTimer();
      setState((prev) => ({
        ...prev,
        status: "error",
        currentTool: null,
        currentFile: null,
        lastError: { message, code: "DISCONNECTED", recoverable: true },
        isLoading: false,
      }));
    },
    [clearDoneTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearDoneTimer();
  }, [clearDoneTimer]);

  return {
    ...state,
    processSignal,
    reset,
    setDisconnected,
  };
}
