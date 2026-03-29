import { describe, it, expect } from "vitest";
import {
  needsAIAssessment,
  buildAssessmentPrompt,
  parseAssessmentResponse,
} from "../src/adaptive-assessment";

describe("adaptive-assessment", () => {
  describe("needsAIAssessment", () => {
    it("returns true when rolling avg is below 0.60", () => {
      expect(needsAIAssessment(0.55)).toBe(true);
    });

    it("returns false when rolling avg is at 0.60", () => {
      expect(needsAIAssessment(0.60)).toBe(false);
    });

    it("returns false when rolling avg is above 0.60", () => {
      expect(needsAIAssessment(0.75)).toBe(false);
    });

    it("returns true for very low confidence", () => {
      expect(needsAIAssessment(0.1)).toBe(true);
    });
  });

  describe("buildAssessmentPrompt", () => {
    it("includes platform name", () => {
      const prompt = buildAssessmentPrompt("p1", "twitter", [0.4, 0.5, 0.55]);
      expect(prompt).toContain("twitter");
    });

    it("includes average confidence", () => {
      const prompt = buildAssessmentPrompt("p1", "twitter", [0.4, 0.5, 0.55]);
      expect(prompt).toContain("48.3%");
    });

    it("includes recent confidence scores", () => {
      const prompt = buildAssessmentPrompt("p1", "instagram", [0.40, 0.55]);
      expect(prompt).toContain("40%");
      expect(prompt).toContain("55%");
    });

    it("requests JSON response", () => {
      const prompt = buildAssessmentPrompt("p1", "linkedin", [0.5]);
      expect(prompt).toContain('"confidence"');
      expect(prompt).toContain('"recommendation"');
    });
  });

  describe("parseAssessmentResponse", () => {
    it("parses valid assessment response", () => {
      const raw = JSON.stringify({
        confidence: 0.55,
        recommendation: "Try adding more industry-specific language",
      });
      const result = parseAssessmentResponse(raw);
      expect(result.confidence).toBe(0.55);
      expect(result.grade).toBe("F");
      expect(result.source).toBe("ai_assisted");
      expect(result.message).toContain("industry-specific");
    });

    it("clamps confidence to 0-1", () => {
      const raw = JSON.stringify({ confidence: 1.5, recommendation: "Good" });
      expect(parseAssessmentResponse(raw).confidence).toBe(1.0);

      const rawNeg = JSON.stringify({ confidence: -0.5, recommendation: "Low" });
      expect(parseAssessmentResponse(rawNeg).confidence).toBe(0.0);
    });

    it("defaults confidence when missing", () => {
      const raw = JSON.stringify({ recommendation: "test" });
      expect(parseAssessmentResponse(raw).confidence).toBe(0.5);
    });

    it("provides fallback message when recommendation is missing", () => {
      const raw = JSON.stringify({ confidence: 0.7 });
      expect(parseAssessmentResponse(raw).message).toContain("could not generate");
    });

    it("throws on invalid JSON", () => {
      expect(() => parseAssessmentResponse("bad")).toThrow();
    });
  });
});
