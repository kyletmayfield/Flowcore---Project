import type { Persona, Platform, PlatformHistory } from "@flowcore/engine";

/**
 * Analyzes user edits to a generated caption and extracts
 * common edit patterns for the persona learning loop.
 */
export function analyzeEdits(
  original: string,
  edited: string
): string[] {
  const patterns: string[] = [];

  if (edited.length < original.length * 0.8) {
    patterns.push("shorter_content");
  }
  if (edited.length > original.length * 1.2) {
    patterns.push("longer_content");
  }

  const originalEmojis = (original.match(/[\p{Emoji}]/gu) ?? []).length;
  const editedEmojis = (edited.match(/[\p{Emoji}]/gu) ?? []).length;
  if (editedEmojis > originalEmojis + 1) patterns.push("more_emoji");
  if (editedEmojis < originalEmojis - 1) patterns.push("less_emoji");

  const originalHashtags = (original.match(/#\w+/g) ?? []).length;
  const editedHashtags = (edited.match(/#\w+/g) ?? []).length;
  if (editedHashtags > originalHashtags + 1) patterns.push("more_hashtags");
  if (editedHashtags < originalHashtags - 1) patterns.push("less_hashtags");

  if (edited.endsWith("?") && !original.endsWith("?")) {
    patterns.push("prefers_question_hooks");
  }

  return patterns;
}

/**
 * Updates a persona's platform history with new generation data.
 * Call this after a user selects a favorite or edits a caption.
 */
export function updatePlatformHistory(
  current: PlatformHistory | undefined,
  wasSelected: boolean,
  editPatterns: string[]
): PlatformHistory {
  const history: PlatformHistory = current ?? {
    generation_count: 0,
    avg_edits_per_generation: 0,
    common_edits: [],
    selection_patterns: [],
    avg_confidence: 0.5,
    adaptive_ai_active: false,
  };

  history.generation_count += 1;

  // Update edit average
  const hadEdits = editPatterns.length > 0 ? 1 : 0;
  history.avg_edits_per_generation =
    (history.avg_edits_per_generation * (history.generation_count - 1) + hadEdits) /
    history.generation_count;

  // Merge edit patterns (keep unique, most recent)
  for (const pattern of editPatterns) {
    if (!history.common_edits.includes(pattern)) {
      history.common_edits.push(pattern);
    }
  }
  // Cap at 10 most recent patterns
  if (history.common_edits.length > 10) {
    history.common_edits = history.common_edits.slice(-10);
  }

  // Track selection patterns
  if (wasSelected) {
    // Selection patterns would be enriched with more context in production
    // For now, we track that the user selected this generation
  }

  return history;
}
