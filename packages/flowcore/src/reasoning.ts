import type { ReasoningTrace, TraceDepth } from "./types.js";

/**
 * Filters a full reasoning trace down to the requested depth.
 * - "full": returns everything
 * - "summary": summary + top 2 factors, no alternatives
 * - "off": returns undefined (no reasoning)
 */
export function formatReasoningTrace(
  trace: ReasoningTrace,
  depth: TraceDepth
): ReasoningTrace | undefined {
  if (depth === "off") {
    return undefined;
  }

  if (depth === "summary") {
    return {
      summary: trace.summary,
      factors: trace.factors.slice(0, 2),
      alternatives_considered: [],
    };
  }

  // "full" — return as-is
  return trace;
}

/**
 * Creates an empty reasoning trace for non-AI nodes
 * or when reasoning is unavailable.
 */
export function emptyTrace(): ReasoningTrace {
  return {
    summary: "",
    factors: [],
    alternatives_considered: [],
  };
}
