import { describe, it, expect } from "vitest";
import { formatReasoningTrace, emptyTrace } from "../src/reasoning.js";
import type { ReasoningTrace } from "../src/types.js";

const fullTrace: ReasoningTrace = {
  summary: "Strong negative sentiment detected.",
  factors: [
    { factor: "Language tone", observation: "Words like 'furious' indicate anger.", weight: "high" },
    { factor: "Escalation request", observation: "Asks to speak with manager.", weight: "medium" },
    { factor: "Prior context", observation: "No prior history available.", weight: "low" },
  ],
  alternatives_considered: [
    { option: "neutral", why_rejected: "Language intensity goes beyond neutral." },
  ],
};

describe("formatReasoningTrace", () => {
  it("returns full trace unchanged for depth=full", () => {
    const result = formatReasoningTrace(fullTrace, "full");
    expect(result).toEqual(fullTrace);
  });

  it("returns summary with top 2 factors and no alternatives for depth=summary", () => {
    const result = formatReasoningTrace(fullTrace, "summary");
    expect(result?.summary).toBe("Strong negative sentiment detected.");
    expect(result?.factors).toHaveLength(2);
    expect(result?.factors[0].factor).toBe("Language tone");
    expect(result?.factors[1].factor).toBe("Escalation request");
    expect(result?.alternatives_considered).toEqual([]);
  });

  it("returns undefined for depth=off", () => {
    const result = formatReasoningTrace(fullTrace, "off");
    expect(result).toBeUndefined();
  });
});

describe("emptyTrace", () => {
  it("returns an empty reasoning trace structure", () => {
    const trace = emptyTrace();
    expect(trace.summary).toBe("");
    expect(trace.factors).toEqual([]);
    expect(trace.alternatives_considered).toEqual([]);
  });
});
