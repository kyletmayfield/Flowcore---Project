declare function setTimeout(callback: () => void, ms: number): unknown;

import type {
  Persona,
  Platform,
  TraceDepth,
  GenerationResult,
  ReasoningTrace,
  Grade,
  ConfidenceEstimate,
} from "@flowcore/engine";
import { calculateGrade } from "@flowcore/engine";
import { getPlatformDefaults } from "./platform-defaults.js";
import { buildContentAnalysisPrompt, parseContentAnalysis } from "./content-analyzer.js";
import type { ContentAnalysis } from "./content-analyzer.js";
import { buildCaptionPrompt } from "./caption-generator.js";
import { calculateHeuristicConfidence } from "./confidence-heuristics.js";
import { needsAIAssessment, buildAssessmentPrompt, parseAssessmentResponse } from "./adaptive-assessment.js";
import { analyzeEdits, updatePlatformHistory } from "./persona-learner.js";

/**
 * Callback for making AI calls (content analysis, caption generation, assessment).
 * In production this calls the Claude API; in demos it returns mock responses.
 */
export type AICallFn = (prompt: string) => Promise<string>;

/**
 * Full result of a multi-platform generation run.
 */
export interface GenerationRun {
  contentAnalysis: ContentAnalysis;
  preGenConfidence: Record<Platform, ConfidenceEstimate>;
  results: Record<Platform, CaptionResult>;
}

export interface CaptionResult {
  caption: string;
  confidence: number;
  grade: Grade;
  reasoning: ReasoningTrace;
  platform: Platform;
  adaptiveAIUsed: boolean;
}

/**
 * Runs the full TheSocialFox generation pipeline for multiple platforms.
 *
 * 1. Content analysis — AI analyzes the input
 * 2. Pre-generation confidence — heuristic per platform
 * 3. Adaptive AI assessment — if confidence is below threshold
 * 4. Caption generation — AI generates per platform
 */
export async function runGeneration(
  persona: Persona,
  platforms: Platform[],
  userContext: string,
  hasImage: boolean,
  traceDepth: TraceDepth,
  aiCall: AICallFn,
  recentConfidences?: Record<Platform, number[]>
): Promise<GenerationRun> {
  // Step 1: Content analysis
  const analysisPrompt = buildContentAnalysisPrompt(userContext, hasImage);
  const analysisRaw = await aiCall(analysisPrompt);
  const contentAnalysis = parseContentAnalysis(analysisRaw);

  // Step 2 & 3: Pre-gen confidence + adaptive assessment per platform
  const preGenConfidence: Record<string, ConfidenceEstimate> = {};
  for (const platform of platforms) {
    let estimate = calculateHeuristicConfidence(persona, platform, userContext.length);

    // Check if adaptive AI assessment is needed
    const platformConfidences = recentConfidences?.[platform] ?? [];
    if (platformConfidences.length > 0) {
      const rollingAvg = platformConfidences.reduce((a, b) => a + b, 0) / platformConfidences.length;
      if (needsAIAssessment(rollingAvg)) {
        const assessPrompt = buildAssessmentPrompt(persona.id, platform, platformConfidences);
        const assessRaw = await aiCall(assessPrompt);
        estimate = parseAssessmentResponse(assessRaw);
      }
    }

    preGenConfidence[platform] = estimate;
  }

  // Step 4: Caption generation per platform
  const results: Record<string, CaptionResult> = {};
  for (const platform of platforms) {
    const defaults = getPlatformDefaults(platform);
    const captionPrompt = buildCaptionPrompt(
      persona,
      platform,
      defaults,
      contentAnalysis,
      userContext,
      traceDepth
    );
    const captionRaw = await aiCall(captionPrompt);
    const parsed = JSON.parse(captionRaw);

    const confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));
    results[platform] = {
      caption: parsed.caption ?? "",
      confidence,
      grade: calculateGrade(confidence),
      reasoning: parsed.reasoning ?? {
        summary: "No reasoning provided",
        factors: [],
        alternatives_considered: [],
      },
      platform,
      adaptiveAIUsed: preGenConfidence[platform].source === "ai_assisted",
    };
  }

  return {
    contentAnalysis,
    preGenConfidence: preGenConfidence as Record<Platform, ConfidenceEstimate>,
    results: results as Record<Platform, CaptionResult>,
  };
}

/**
 * Creates a mock AI call function for demos.
 * Returns realistic mock responses based on the prompt content.
 */
export function createMockSocialFoxAI(): AICallFn {
  return async (prompt: string): Promise<string> => {
    // Simulate latency
    await new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 300));

    // Content analysis prompt
    if (prompt.includes("content input and determine its type")) {
      return JSON.stringify({
        type: "product_shot",
        mood: "aspirational",
        key_elements: ["clean aesthetic", "brand focus", "lifestyle context"],
      });
    }

    // Assessment prompt
    if (prompt.includes("evaluating a persona's readiness")) {
      return JSON.stringify({
        confidence: 0.55,
        recommendation: "Try posting more frequently on this platform to build up persona history.",
      });
    }

    // Caption generation prompt — detect platform from prompt content
    if (prompt.includes("PLATFORM: instagram")) {
      return JSON.stringify({
        caption: "The details matter. Every texture, every shadow tells a story. This is what happens when you stop rushing and start creating with intention. \u2728\n\nWhat detail catches your eye first? Drop it below \ud83d\udc47\n\n#design #creative #intentional #detail #craft #minimal #aesthetic #storytelling #brandlife #quality",
        confidence: 0.88,
        reasoning: {
          summary: "Long-form storytelling caption with engagement hook, aligned with Instagram norms and persona voice.",
          factors: [
            { factor: "Platform norms", observation: "Instagram favors longer, story-driven captions with hashtags", weight: "high" },
            { factor: "Persona voice", observation: "Matched aspirational, creative tone from persona definition", weight: "high" },
            { factor: "Engagement hook", observation: "Added question CTA to drive comments", weight: "medium" },
          ],
          alternatives_considered: [
            { option: "Short punchy caption", why_rejected: "Instagram algorithm favors longer captions for engagement" },
          ],
        },
      });
    }

    if (prompt.includes("PLATFORM: twitter")) {
      return JSON.stringify({
        caption: "Stopped rushing. Started noticing. The difference shows.",
        confidence: 0.72,
        reasoning: {
          summary: "Concise, punchy caption within 280 chars. Conversational tone matches Twitter norms.",
          factors: [
            { factor: "Character limit", observation: "Well under 280 characters", weight: "high" },
            { factor: "Tone", observation: "Punchy and conversational for Twitter audience", weight: "medium" },
          ],
          alternatives_considered: [
            { option: "Thread format", why_rejected: "Single tweet is stronger for this content type" },
          ],
        },
      });
    }

    if (prompt.includes("PLATFORM: linkedin")) {
      return JSON.stringify({
        caption: "In a world of fast output, we chose slow craft.\n\nThe result? A product that speaks for itself. Every detail was intentional. Every choice was deliberate.\n\nThe best brands aren't built on speed. They're built on standards.\n\n#BrandStrategy #QualityOverQuantity #ProductDesign #Leadership #Craftsmanship",
        confidence: 0.81,
        reasoning: {
          summary: "Professional, insight-driven caption with industry framing suitable for LinkedIn audience.",
          factors: [
            { factor: "Professional tone", observation: "Industry-appropriate language without being stiff", weight: "high" },
            { factor: "Thought leadership", observation: "Frames product quality as a business philosophy", weight: "medium" },
            { factor: "Hashtags", observation: "3-5 relevant professional hashtags", weight: "low" },
          ],
          alternatives_considered: [
            { option: "Personal anecdote format", why_rejected: "Product focus calls for brand-level messaging" },
          ],
        },
      });
    }

    if (prompt.includes("PLATFORM: facebook")) {
      return JSON.stringify({
        caption: "We put so much love into this one. \ud83d\ude4f Every detail was hand-picked, every texture tells part of the story. Can\u2019t wait for you to see it in person!\n\nWho\u2019s ready? Tag someone who\u2019d love this!",
        confidence: 0.76,
        reasoning: {
          summary: "Community-oriented, shareable caption with personal touch for Facebook audience.",
          factors: [
            { factor: "Community tone", observation: "Warm, personal language that invites sharing", weight: "high" },
            { factor: "Shareability", observation: "Tag CTA encourages reach", weight: "medium" },
          ],
          alternatives_considered: [
            { option: "Formal product announcement", why_rejected: "Facebook favors personal, community-driven content" },
          ],
        },
      });
    }

    // Fallback
    return JSON.stringify({
      caption: "Check this out!",
      confidence: 0.5,
      reasoning: {
        summary: "Generic fallback caption.",
        factors: [],
        alternatives_considered: [],
      },
    });
  };
}

// Re-export helpers for the UI
export { analyzeEdits, updatePlatformHistory };
