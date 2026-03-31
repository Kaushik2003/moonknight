"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

import { LiquidMetalButton } from "@/components/liquid-metal-button";
import { useChatContext } from "@/contexts/ChatContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClerkSession } from "@/hooks/useClerkSession";

const examplePrompts = [
  "Create a staking contract with 7-day lockup period",
  "Build a token swap interface for XLM to USDC",
  "Generate a voting DAO with proposal system",
];

export function IntentBox() {


  const [prompt, setPrompt] = useState("");
  const { setPendingPrompt } = useChatContext();
  const router = useRouter();
  const { session, loading } = useClerkSession();

  // Speech recognition
  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onTranscript: (transcript) => {
      // Append transcript to current prompt
      setPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    }
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleGenerate = () => {
    if (!loading && !session) {
      router.push("/auth/login?next=/");
      return;
    }

    // Set the pending prompt - ChatPanel will pick this up and trigger the API call
    if (prompt.trim()) {
      setPendingPrompt({
        content: prompt.trim(),
        timestamp: Date.now(),
      });
    }
    // Navigate to generate page
    router.push("/generate");
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white/15 via-purple-300/10 to-white/15 blur-xl opacity-40" />
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-black/80 border border-white/15 shadow-2xl ring-1 ring-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            background: "linear-gradient(110deg, transparent 12%, rgba(255,255,255,0.06) 26%, rgba(182,128,255,0.32) 42%, rgba(255,255,255,0.08) 56%, transparent 72%)",
            backgroundSize: "220% 100%",
            animation: "intent-glimmer 5.8s linear infinite",
          }}
        />


        {/* Textarea */}
        <div className="p-4 relative z-10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Build a Compact staking contract with automated rewards distribution..."
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-white placeholder:text-white/75 placeholder:font-medium text-sm leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          {/* Microphone button */}
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full transition-all",
                isListening
                  ? "bg-red-500/20 text-red-500 animate-pulse"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              title={isListening ? "Stop recording" : "Start voice input"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between p-4 border-t border-white/15 bg-white/[0.03]">
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="text-xs text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
              >
                {example.slice(0, 30)}...
              </button>
            ))}
          </div>
          <LiquidMetalButton onClick={handleGenerate} />
        </div>
      </div>

      <style jsx>{`
        @keyframes intent-glimmer {
          0% {
            background-position: 130% 0;
          }
          100% {
            background-position: -130% 0;
          }
        }
      `}</style>
    </div>
  );
}
