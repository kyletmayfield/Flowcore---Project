import { describe, it, expect } from "vitest";
import { analyzeEdits, updatePlatformHistory } from "../src/persona-learner";
import type { PlatformHistory } from "@flowcore/engine";

describe("persona-learner", () => {
  describe("analyzeEdits", () => {
    it("detects shorter content", () => {
      const original = "This is a long original caption with lots of detail and description.";
      const edited = "Short caption.";
      expect(analyzeEdits(original, edited)).toContain("shorter_content");
    });

    it("detects longer content", () => {
      const original = "Short.";
      const edited = "This is a much longer version with more detail and storytelling elements added.";
      expect(analyzeEdits(original, edited)).toContain("longer_content");
    });

    it("detects question hook addition", () => {
      const original = "Check out our new product.";
      const edited = "Ready for something new?";
      expect(analyzeEdits(original, edited)).toContain("prefers_question_hooks");
    });

    it("detects more hashtags", () => {
      const original = "Great product #launch";
      const edited = "Great product #launch #new #exciting #tech";
      expect(analyzeEdits(original, edited)).toContain("more_hashtags");
    });

    it("detects fewer hashtags", () => {
      const original = "Post #one #two #three #four";
      const edited = "Post #one";
      expect(analyzeEdits(original, edited)).toContain("less_hashtags");
    });

    it("returns empty array when no significant changes", () => {
      const original = "Check out this product.";
      const edited = "Check out this product!";
      const patterns = analyzeEdits(original, edited);
      expect(patterns).toEqual([]);
    });
  });

  describe("updatePlatformHistory", () => {
    it("creates new history when none exists", () => {
      const result = updatePlatformHistory(undefined, false, []);
      expect(result.generation_count).toBe(1);
      expect(result.avg_edits_per_generation).toBe(0);
      expect(result.common_edits).toEqual([]);
    });

    it("increments generation count", () => {
      const existing: PlatformHistory = {
        generation_count: 5,
        avg_edits_per_generation: 0.4,
        common_edits: [],
        selection_patterns: [],
        avg_confidence: 0.7,
        adaptive_ai_active: false,
      };
      const result = updatePlatformHistory(existing, false, []);
      expect(result.generation_count).toBe(6);
    });

    it("updates edit average when edits are made", () => {
      const existing: PlatformHistory = {
        generation_count: 4,
        avg_edits_per_generation: 0.5,
        common_edits: [],
        selection_patterns: [],
        avg_confidence: 0.7,
        adaptive_ai_active: false,
      };
      // 5th generation with edits: (0.5*4 + 1) / 5 = 0.6
      const result = updatePlatformHistory(existing, false, ["shorter_content"]);
      expect(result.avg_edits_per_generation).toBeCloseTo(0.6);
    });

    it("adds new edit patterns to common_edits", () => {
      const existing: PlatformHistory = {
        generation_count: 3,
        avg_edits_per_generation: 0.3,
        common_edits: ["shorter_content"],
        selection_patterns: [],
        avg_confidence: 0.7,
        adaptive_ai_active: false,
      };
      const result = updatePlatformHistory(existing, false, ["more_emoji"]);
      expect(result.common_edits).toContain("shorter_content");
      expect(result.common_edits).toContain("more_emoji");
    });

    it("does not duplicate existing patterns", () => {
      const existing: PlatformHistory = {
        generation_count: 3,
        avg_edits_per_generation: 0.3,
        common_edits: ["shorter_content"],
        selection_patterns: [],
        avg_confidence: 0.7,
        adaptive_ai_active: false,
      };
      const result = updatePlatformHistory(existing, false, ["shorter_content"]);
      const count = result.common_edits.filter((e) => e === "shorter_content").length;
      expect(count).toBe(1);
    });

    it("caps common_edits at 10", () => {
      const existing: PlatformHistory = {
        generation_count: 10,
        avg_edits_per_generation: 1.0,
        common_edits: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
        selection_patterns: [],
        avg_confidence: 0.7,
        adaptive_ai_active: false,
      };
      const result = updatePlatformHistory(existing, false, ["k"]);
      expect(result.common_edits.length).toBe(10);
      expect(result.common_edits).toContain("k");
    });
  });
});
