import { describe, it, expect } from "vitest";
import { buildContentAnalysisPrompt, parseContentAnalysis } from "../src/content-analyzer";

describe("content-analyzer", () => {
  describe("buildContentAnalysisPrompt", () => {
    it("includes user context in prompt", () => {
      const prompt = buildContentAnalysisPrompt("New product launch photo", true);
      expect(prompt).toContain("New product launch photo");
    });

    it("indicates image is provided when true", () => {
      const prompt = buildContentAnalysisPrompt("test", true);
      expect(prompt).toContain("IMAGE PROVIDED: Yes");
    });

    it("indicates no image when false", () => {
      const prompt = buildContentAnalysisPrompt("test", false);
      expect(prompt).toContain("IMAGE PROVIDED: No");
    });

    it("requests JSON response format", () => {
      const prompt = buildContentAnalysisPrompt("test", true);
      expect(prompt).toContain('"type"');
      expect(prompt).toContain('"mood"');
      expect(prompt).toContain('"key_elements"');
    });

    it("lists valid content types", () => {
      const prompt = buildContentAnalysisPrompt("test", true);
      expect(prompt).toContain("product_shot");
      expect(prompt).toContain("lifestyle");
      expect(prompt).toContain("event");
      expect(prompt).toContain("educational");
    });
  });

  describe("parseContentAnalysis", () => {
    it("parses valid JSON response", () => {
      const raw = JSON.stringify({
        type: "product_shot",
        mood: "aspirational",
        key_elements: ["warm lighting", "minimal background"],
      });
      const result = parseContentAnalysis(raw);
      expect(result.type).toBe("product_shot");
      expect(result.mood).toBe("aspirational");
      expect(result.key_elements).toEqual(["warm lighting", "minimal background"]);
    });

    it("defaults missing type to 'other'", () => {
      const raw = JSON.stringify({ mood: "casual", key_elements: [] });
      expect(parseContentAnalysis(raw).type).toBe("other");
    });

    it("defaults missing mood to 'casual'", () => {
      const raw = JSON.stringify({ type: "event", key_elements: [] });
      expect(parseContentAnalysis(raw).mood).toBe("casual");
    });

    it("defaults missing key_elements to empty array", () => {
      const raw = JSON.stringify({ type: "event", mood: "casual" });
      expect(parseContentAnalysis(raw).key_elements).toEqual([]);
    });

    it("throws on invalid JSON", () => {
      expect(() => parseContentAnalysis("not json")).toThrow();
    });
  });
});
