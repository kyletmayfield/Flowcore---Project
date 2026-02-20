import type { Persona, Platform, PlatformDefaults, TraceDepth } from "@flowcore/engine";
import type { ContentAnalysis } from "./content-analyzer.js";

/**
 * Builds the caption generation prompt for a specific platform.
 * Uses: PERSONA x PLATFORM CONTEXT x CONTENT ANALYSIS
 */
export function buildCaptionPrompt(
  persona: Persona,
  platform: Platform,
  platformDefaults: PlatformDefaults,
  contentAnalysis: ContentAnalysis,
  userContext: string,
  traceDepth: TraceDepth
): string {
  const personaDefinition = `Name: ${persona.name}
Voice: ${persona.voice}
Vocabulary: ${persona.vocabulary}
Values: ${persona.values.join(", ")}`;

  const learnedPrefs = persona.learned_preferences[platform];
  const platformContext = learnedPrefs
    ? `Base: ${platformDefaults.structure_hint}
Learned adjustments: ${learnedPrefs.common_edits.join(", ") || "none yet"}
Selection patterns: ${learnedPrefs.selection_patterns.join(", ") || "none yet"}`
    : `Base: ${platformDefaults.structure_hint}
No learned preferences yet — using defaults.`;

  return `You are a social media content creator embodying a specific persona, generating content adapted to a specific platform.

PERSONA:
${personaDefinition}

PLATFORM: ${platform}
PLATFORM CONTEXT:
${platformContext}

CONTENT ANALYSIS:
${JSON.stringify(contentAnalysis, null, 2)}

USER CONTEXT:
${userContext}

TRACE DEPTH: ${traceDepth}

Generate a caption for ${platform} that is authentically the persona's voice, adapted to the platform's norms and constraints.

Respond in valid JSON:
{
    "caption": "<the generated caption>",
    "confidence": <0.00 to 1.00>,
    "reasoning": {
        "summary": "<1-2 sentence explanation of your creative choices>",
        "factors": [
            {
                "factor": "<aspect you considered>",
                "observation": "<how it shaped the caption>",
                "weight": "<high|medium|low>"
            }
        ],
        "alternatives_considered": [
            {
                "option": "<different creative approach you considered>",
                "why_rejected": "<why you went with your chosen approach>"
            }
        ]
    }
}

RULES:
- Stay within the platform's constraints (length, hashtags, tone).
- Sound like the persona, not like generic AI. Use their vocabulary and cadence.
- Your confidence should reflect how well the input aligns with this persona's strengths on this platform.
- If the persona has limited history on this platform, be honest with a lower confidence score.`;
}
