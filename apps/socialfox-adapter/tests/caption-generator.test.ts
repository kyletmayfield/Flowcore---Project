import { describe, it, expect } from "vitest";
import { buildCaptionPrompt } from "../src/caption-generator";
import type { Persona, PlatformDefaults } from "@flowcore/engine";
import type { ContentAnalysis } from "../src/content-analyzer";

const testPersona: Persona = {
  id: "p1",
  user_id: "u1",
  name: "Tech Brand",
  voice: "innovative, approachable",
  vocabulary: "tech-forward, accessible",
  values: ["innovation", "community"],
  learned_preferences: {
    instagram: {
      generation_count: 20,
      avg_edits_per_generation: 0.8,
      common_edits: ["shorter_content"],
      selection_patterns: ["prefers_question_hooks"],
      avg_confidence: 0.82,
      adaptive_ai_active: false,
    },
  },
  created_at: "2026-01-01",
  updated_at: "2026-02-01",
};

const testDefaults: PlatformDefaults = {
  platform: "instagram",
  max_length: null,
  hashtag_range: { min: 5, max: 10 },
  emoji_allowed: true,
  tone_modifier: "visual storytelling, authentic",
  structure_hint: "Long-form friendly, visual storytelling, 5-10 hashtags",
};

const testAnalysis: ContentAnalysis = {
  type: "product_shot",
  mood: "aspirational",
  key_elements: ["warm lighting", "hero product"],
};

describe("caption-generator", () => {
  it("includes persona definition in prompt", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "Launch day!", "full");
    expect(prompt).toContain("Tech Brand");
    expect(prompt).toContain("innovative, approachable");
    expect(prompt).toContain("innovation");
  });

  it("includes platform name", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "Launch day!", "full");
    expect(prompt).toContain("PLATFORM: instagram");
  });

  it("includes content analysis", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "Launch day!", "full");
    expect(prompt).toContain("product_shot");
    expect(prompt).toContain("aspirational");
  });

  it("includes learned preferences when available", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "test", "full");
    expect(prompt).toContain("shorter_content");
    expect(prompt).toContain("prefers_question_hooks");
  });

  it("shows default message when no learned preferences", () => {
    const prompt = buildCaptionPrompt(testPersona, "twitter", testDefaults, testAnalysis, "test", "full");
    expect(prompt).toContain("No learned preferences yet");
  });

  it("includes trace depth", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "test", "summary");
    expect(prompt).toContain("TRACE DEPTH: summary");
  });

  it("requests JSON response format", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "test", "full");
    expect(prompt).toContain('"caption"');
    expect(prompt).toContain('"confidence"');
    expect(prompt).toContain('"reasoning"');
  });

  it("includes user context", () => {
    const prompt = buildCaptionPrompt(testPersona, "instagram", testDefaults, testAnalysis, "Big launch today!", "full");
    expect(prompt).toContain("Big launch today!");
  });
});
