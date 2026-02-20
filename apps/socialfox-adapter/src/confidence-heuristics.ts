import type { Persona, Platform, ConfidenceEstimate } from "@flowcore/engine";
import { calculateGrade } from "@flowcore/engine";

/**
 * Calculates pre-generation confidence using heuristics only (no API call).
 * This is fast, free, and deterministic.
 *
 * Inputs:
 * - generation_count per platform (more history = higher confidence)
 * - avg_edits_per_generation per platform (fewer edits = better calibration)
 * - content input quality (context description length)
 * - content type familiarity (has persona generated this type before?)
 */
export function calculateHeuristicConfidence(
  persona: Persona,
  platform: Platform,
  contextLength: number
): ConfidenceEstimate {
  const history = persona.learned_preferences[platform];

  let confidence = 0.5; // base

  if (history) {
    // More generations = higher confidence (caps at +0.25)
    const generationBonus = Math.min(history.generation_count / 80, 0.25);
    confidence += generationBonus;

    // Lower edit rate = better calibration (caps at +0.15)
    if (history.generation_count > 5) {
      const editPenalty = Math.min(history.avg_edits_per_generation * 0.05, 0.15);
      confidence += 0.15 - editPenalty;
    }
  }

  // Context quality bonus (longer context = more to work with)
  if (contextLength > 100) {
    confidence += 0.05;
  } else if (contextLength > 50) {
    confidence += 0.03;
  }

  // Clamp to 0-1
  confidence = Math.max(0, Math.min(1, confidence));

  const grade = calculateGrade(confidence);
  let message: string;

  if (grade === "A" || grade === "B") {
    message = `Strong match — ${history?.generation_count ?? 0} prior generations, low edit rate`;
  } else if (grade === "C") {
    message = "Moderate match — suggest selecting more favorites to improve";
  } else if (grade === "D") {
    message = "Limited history — generate a few posts and select favorites to help your persona learn";
  } else {
    message = `Weak match — only ${history?.generation_count ?? 0} prior generations for this platform`;
  }

  return {
    confidence,
    grade,
    source: "heuristic",
    message,
  };
}
