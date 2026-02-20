/**
 * Content analysis trigger — analyzes user input (photo context, text)
 * and determines content type, mood, and key elements.
 *
 * This is the first node in the TheSocialFox workflow.
 */

export interface ContentAnalysis {
  type: string; // product_shot, lifestyle, event, behind_the_scenes, testimonial, educational
  mood: string; // aspirational, informative, casual, urgent, celebratory
  key_elements: string[];
}

/**
 * Builds the prompt for the content analysis AI node.
 */
export function buildContentAnalysisPrompt(
  userContext: string,
  hasImage: boolean
): string {
  return `Analyze the following social media content input and determine its type, mood, and key elements.

USER CONTEXT:
${userContext}

IMAGE PROVIDED: ${hasImage ? "Yes" : "No"}

Respond in valid JSON:
{
    "type": "<one of: product_shot, lifestyle, event, behind_the_scenes, testimonial, educational, announcement, other>",
    "mood": "<one of: aspirational, informative, casual, urgent, celebratory, professional, playful>",
    "key_elements": ["<list of notable elements from the content>"]
}`;
}

/**
 * Parses the content analysis response.
 */
export function parseContentAnalysis(raw: string): ContentAnalysis {
  const parsed = JSON.parse(raw);
  return {
    type: parsed.type ?? "other",
    mood: parsed.mood ?? "casual",
    key_elements: parsed.key_elements ?? [],
  };
}
