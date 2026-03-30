// instrumentation.ts
// Initializes OpenTelemetry with Langfuse for LLM observability.
// Next.js 16 loads this file automatically at startup.
// Uses NodeTracerProvider (NOT @vercel/otel) per Langfuse docs.

import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor],
});

tracerProvider.register();
