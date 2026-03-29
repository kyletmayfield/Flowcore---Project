import type { PlatformDefaults, Platform } from "@flowcore/engine";

/**
 * Smart defaults for each social platform.
 * These are the starting point for every persona — the persona engine
 * learns platform-specific preferences over time through user edits
 * and selections.
 */
export const PLATFORM_DEFAULTS: Record<Platform, PlatformDefaults> = {
  instagram: {
    platform: "instagram",
    max_length: null, // long-form friendly
    hashtag_range: { min: 5, max: 10 },
    emoji_allowed: true,
    tone_modifier: "visual storytelling, authentic, engaging",
    structure_hint: "Long-form friendly, visual storytelling, 5-10 hashtags, emoji OK",
  },
  twitter: {
    platform: "twitter",
    max_length: 280,
    hashtag_range: { min: 0, max: 1 },
    emoji_allowed: true,
    tone_modifier: "conversational, punchy, concise",
    structure_hint: "Under 280 chars, conversational, 0-1 hashtags, punchy",
  },
  linkedin: {
    platform: "linkedin",
    max_length: null,
    hashtag_range: { min: 3, max: 5 },
    emoji_allowed: false,
    tone_modifier: "professional, insight-driven, industry context",
    structure_hint: "Professional framing, industry context, 3-5 hashtags, insight-driven",
  },
  facebook: {
    platform: "facebook",
    max_length: null,
    hashtag_range: { min: 0, max: 3 },
    emoji_allowed: true,
    tone_modifier: "community-oriented, shareable, personal touch",
    structure_hint: "Community-oriented, medium length, shareable, personal touch",
  },
};

export function getPlatformDefaults(platform: Platform): PlatformDefaults {
  return PLATFORM_DEFAULTS[platform];
}
