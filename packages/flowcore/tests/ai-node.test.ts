import { describe, it, expect } from "vitest";
import { buildAINodePrompt, parseAIResponse } from "../src/ai-node.js";
import type { NodeConfig } from "../src/types.js";

describe("buildAINodePrompt", () => {
  const config: NodeConfig = {
    label: "Sentiment Analyzer",
    instruction: "Classify the sentiment of the input message.",
    output_schema: ["positive", "negative", "neutral"],
  };
  const payload = { message: "I love this product!" };

  it("includes instruction and output schema in the prompt", () => {
    const prompt = buildAINodePrompt(config, payload, "full");
    expect(prompt).toContain("Classify the sentiment of the input message.");
    expect(prompt).toContain('"positive"');
    expect(prompt).toContain('"negative"');
    expect(prompt).toContain('"neutral"');
  });

  it("includes input payload in the prompt", () => {
    const prompt = buildAINodePrompt(config, payload, "full");
    expect(prompt).toContain("I love this product!");
  });

  it("includes full trace format for trace_depth=full", () => {
    const prompt = buildAINodePrompt(config, payload, "full");
    expect(prompt).toContain("alternatives_considered");
    expect(prompt).toContain("TRACE DEPTH: full");
  });

  it("includes summary trace format for trace_depth=summary", () => {
    const prompt = buildAINodePrompt(config, payload, "summary");
    expect(prompt).toContain("top 2 factors only");
    expect(prompt).toContain("TRACE DEPTH: summary");
  });

  it("includes minimal format for trace_depth=off", () => {
    const prompt = buildAINodePrompt(config, payload, "off");
    expect(prompt).not.toContain("alternatives_considered");
    expect(prompt).toContain("TRACE DEPTH: off");
  });

  it("uses default instruction when none provided", () => {
    const minConfig: NodeConfig = { label: "Test" };
    const prompt = buildAINodePrompt(minConfig, {}, "off");
    expect(prompt).toContain("Analyze the input and decide.");
  });
});

describe("parseAIResponse", () => {
  it("parses a full response with reasoning", () => {
    const raw = JSON.stringify({
      decision: "positive",
      confidence: 0.92,
      reasoning: {
        summary: "Strong positive language detected.",
        factors: [
          { factor: "Language tone", observation: "Words like 'love' indicate strong positive.", weight: "high" },
        ],
        alternatives_considered: [
          { option: "neutral", why_rejected: "Too strong for neutral." },
        ],
      },
    });

    const result = parseAIResponse(raw, "full");
    expect(result.decision).toBe("positive");
    expect(result.confidence).toBe(0.92);
    expect(result.reasoning?.summary).toBe("Strong positive language detected.");
    expect(result.reasoning?.factors).toHaveLength(1);
    expect(result.reasoning?.alternatives_considered).toHaveLength(1);
  });

  it("parses an off-depth response (no reasoning)", () => {
    const raw = JSON.stringify({
      decision: "negative",
      confidence: 0.75,
    });

    const result = parseAIResponse(raw, "off");
    expect(result.decision).toBe("negative");
    expect(result.confidence).toBe(0.75);
    expect(result.reasoning).toBeUndefined();
  });

  it("clamps confidence to 0-1 range", () => {
    const overRaw = JSON.stringify({ decision: "a", confidence: 1.5 });
    expect(parseAIResponse(overRaw, "off").confidence).toBe(1);

    const underRaw = JSON.stringify({ decision: "a", confidence: -0.3 });
    expect(parseAIResponse(underRaw, "off").confidence).toBe(0);
  });

  it("throws on missing decision", () => {
    const raw = JSON.stringify({ confidence: 0.5 });
    expect(() => parseAIResponse(raw, "off")).toThrow("missing 'decision'");
  });

  it("throws on missing confidence", () => {
    const raw = JSON.stringify({ decision: "positive" });
    expect(() => parseAIResponse(raw, "off")).toThrow("missing 'confidence'");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseAIResponse("not json", "off")).toThrow();
  });
});
