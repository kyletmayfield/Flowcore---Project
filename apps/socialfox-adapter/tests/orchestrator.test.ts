import { describe, it, expect } from "vitest";
import { runGeneration, createMockSocialFoxAI } from "../src/orchestrator";
import type { Persona } from "@flowcore/engine";

const testPersona: Persona = {
  id: "p_test",
  user_id: "u_test",
  name: "Creative Brand",
  voice: "aspirational, authentic, design-forward",
  vocabulary: "craft, intentional, story, detail",
  values: ["quality", "authenticity", "design"],
  learned_preferences: {
    instagram: {
      generation_count: 25,
      avg_edits_per_generation: 0.6,
      common_edits: ["shorter_content"],
      selection_patterns: ["prefers_question_hooks"],
      avg_confidence: 0.85,
      adaptive_ai_active: false,
    },
  },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
};

describe("orchestrator", () => {
  const mockAI = createMockSocialFoxAI();

  it("runs full generation pipeline for a single platform", async () => {
    const result = await runGeneration(
      testPersona,
      ["instagram"],
      "New product launch — clean aesthetic, minimal background",
      true,
      "full",
      mockAI
    );

    expect(result.contentAnalysis).toBeDefined();
    expect(result.contentAnalysis.type).toBe("product_shot");
    expect(result.preGenConfidence.instagram).toBeDefined();
    expect(result.results.instagram).toBeDefined();
    expect(result.results.instagram.caption.length).toBeGreaterThan(0);
    expect(result.results.instagram.confidence).toBeGreaterThan(0);
    expect(["A", "B", "C", "D", "F"]).toContain(result.results.instagram.grade);
    expect(result.results.instagram.reasoning.summary).toBeTruthy();
  });

  it("runs generation for all 4 platforms", async () => {
    const result = await runGeneration(
      testPersona,
      ["instagram", "twitter", "linkedin", "facebook"],
      "Product launch photo with warm lighting",
      true,
      "full",
      mockAI
    );

    expect(Object.keys(result.results)).toEqual(["instagram", "twitter", "linkedin", "facebook"]);
    expect(Object.keys(result.preGenConfidence)).toEqual(["instagram", "twitter", "linkedin", "facebook"]);

    // Each platform should have a caption
    for (const platform of ["instagram", "twitter", "linkedin", "facebook"] as const) {
      expect(result.results[platform].caption.length).toBeGreaterThan(0);
      expect(result.results[platform].platform).toBe(platform);
    }
  });

  it("includes content analysis from first step", async () => {
    const result = await runGeneration(testPersona, ["instagram"], "Test context", false, "full", mockAI);
    expect(result.contentAnalysis.type).toBeTruthy();
    expect(result.contentAnalysis.mood).toBeTruthy();
    expect(Array.isArray(result.contentAnalysis.key_elements)).toBe(true);
  });

  it("provides heuristic pre-gen confidence", async () => {
    const result = await runGeneration(testPersona, ["instagram", "twitter"], "Test", false, "full", mockAI);

    // Instagram has history, should be higher confidence
    expect(result.preGenConfidence.instagram.confidence).toBeGreaterThan(
      result.preGenConfidence.twitter.confidence
    );
    expect(result.preGenConfidence.instagram.source).toBe("heuristic");
  });

  it("triggers adaptive AI assessment when recent confidence is low", async () => {
    const result = await runGeneration(
      testPersona,
      ["twitter"],
      "Test post",
      false,
      "full",
      mockAI,
      { twitter: [0.4, 0.45, 0.5, 0.55], instagram: [], linkedin: [], facebook: [] }
    );

    expect(result.preGenConfidence.twitter.source).toBe("ai_assisted");
  });

  it("does not trigger adaptive AI when recent confidence is high", async () => {
    const result = await runGeneration(
      testPersona,
      ["instagram"],
      "Test post",
      false,
      "full",
      mockAI,
      { instagram: [0.85, 0.88, 0.90], twitter: [], linkedin: [], facebook: [] }
    );

    expect(result.preGenConfidence.instagram.source).toBe("heuristic");
  });

  it("each platform result has reasoning trace", async () => {
    const result = await runGeneration(
      testPersona,
      ["instagram", "linkedin"],
      "Launch day",
      true,
      "full",
      mockAI
    );

    for (const platform of ["instagram", "linkedin"] as const) {
      expect(result.results[platform].reasoning).toBeDefined();
      expect(result.results[platform].reasoning.summary).toBeTruthy();
      expect(result.results[platform].reasoning.factors.length).toBeGreaterThan(0);
    }
  });
});
