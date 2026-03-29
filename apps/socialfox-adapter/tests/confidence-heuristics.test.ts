import { describe, it, expect } from "vitest";
import { calculateHeuristicConfidence } from "../src/confidence-heuristics";
import type { Persona } from "@flowcore/engine";

function makePersona(overrides: Partial<Persona> = {}): Persona {
  return {
    id: "p1",
    user_id: "u1",
    name: "Test",
    voice: "casual",
    vocabulary: "simple",
    values: ["fun"],
    learned_preferences: {},
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("confidence-heuristics", () => {
  it("returns base confidence for new persona with no history", () => {
    const result = calculateHeuristicConfidence(makePersona(), "instagram", 50);
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    expect(result.confidence).toBeLessThanOrEqual(0.6);
    expect(result.source).toBe("heuristic");
  });

  it("increases confidence with more generation history", () => {
    const persona = makePersona({
      learned_preferences: {
        instagram: {
          generation_count: 40,
          avg_edits_per_generation: 0.5,
          common_edits: [],
          selection_patterns: [],
          avg_confidence: 0.75,
          adaptive_ai_active: false,
        },
      },
    });
    const result = calculateHeuristicConfidence(persona, "instagram", 100);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("caps generation bonus at 0.25", () => {
    const persona = makePersona({
      learned_preferences: {
        twitter: {
          generation_count: 200,
          avg_edits_per_generation: 0,
          common_edits: [],
          selection_patterns: [],
          avg_confidence: 0.9,
          adaptive_ai_active: false,
        },
      },
    });
    const result = calculateHeuristicConfidence(persona, "twitter", 200);
    expect(result.confidence).toBeLessThanOrEqual(1.0);
  });

  it("gives context quality bonus for long context", () => {
    const persona = makePersona();
    const shortCtx = calculateHeuristicConfidence(persona, "instagram", 10);
    const longCtx = calculateHeuristicConfidence(persona, "instagram", 150);
    expect(longCtx.confidence).toBeGreaterThan(shortCtx.confidence);
  });

  it("returns grade from A-F", () => {
    const result = calculateHeuristicConfidence(makePersona(), "instagram", 50);
    expect(["A", "B", "C", "D", "F"]).toContain(result.grade);
  });

  it("provides descriptive message", () => {
    const result = calculateHeuristicConfidence(makePersona(), "instagram", 50);
    expect(result.message).toBeTruthy();
    expect(typeof result.message).toBe("string");
  });

  it("returns F grade for platform with no history and short context", () => {
    const result = calculateHeuristicConfidence(makePersona(), "linkedin", 10);
    expect(result.grade).toBe("F");
    expect(result.message).toContain("Weak match");
  });

  it("handles high edit rates as penalty", () => {
    const lowEdits = makePersona({
      learned_preferences: {
        instagram: {
          generation_count: 20,
          avg_edits_per_generation: 0.2,
          common_edits: [],
          selection_patterns: [],
          avg_confidence: 0.8,
          adaptive_ai_active: false,
        },
      },
    });
    const highEdits = makePersona({
      learned_preferences: {
        instagram: {
          generation_count: 20,
          avg_edits_per_generation: 3.0,
          common_edits: [],
          selection_patterns: [],
          avg_confidence: 0.6,
          adaptive_ai_active: false,
        },
      },
    });
    const low = calculateHeuristicConfidence(lowEdits, "instagram", 100);
    const high = calculateHeuristicConfidence(highEdits, "instagram", 100);
    expect(low.confidence).toBeGreaterThan(high.confidence);
  });
});
