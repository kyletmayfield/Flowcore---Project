import type { Platform, ConfidenceEstimate } from "@flowcore/engine";
import { calculateGrade } from "@flowcore/engine";

/**
 * Adaptive AI assessment threshold.
 * When a platform's rolling average confidence drops below this,
 * AI-assisted pre-generation assessment activates.
 */
const ACTIVATION_THRESHOLD = 0.60;

/**
 * Determines whether a platform needs AI-assisted assessment
 * based on its rolling average confidence across recent generations.
 */
export function needsAIAssessment(rollingAvgConfidence: number): boolean {
  return rollingAvgConfidence < ACTIVATION_THRESHOLD;
}

/**
 * Builds the prompt for AI-assisted pre-generation assessment.
 * This is one lightweight Claude call to better analyze persona-platform fit.
 */
export function buildAssessmentPrompt(
  personaId: string,
  platform: Platform,
  recentConfidences: number[]
): string {
  const avg = recentConfidences.reduce((a, b) => a + b, 0) / recentConfidences.length;

  return `You are evaluating a persona's readiness to generate content for ${platform}.

The persona's recent ${recentConfidences.length} generations on ${platform} averaged ${(avg * 100).toFixed(1)}% confidence — below the passing threshold of 60%.

Recent confidence scores: ${recentConfidences.map((c) => `${(c * 100).toFixed(0)}%`).join(", ")}

Provide a brief assessment and recommendation:
{
    "confidence": <your assessed confidence 0.00 to 1.00>,
    "recommendation": "<specific tip to improve this platform's output>"
}`;
}

/**
 * Parses the AI assessment response into a ConfidenceEstimate.
 */
export function parseAssessmentResponse(raw: string): ConfidenceEstimate {
  const parsed = JSON.parse(raw);
  const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));

  return {
    confidence,
    grade: calculateGrade(confidence),
    source: "ai_assisted",
    message: parsed.recommendation ?? "AI assessment could not generate a recommendation.",
  };
}
