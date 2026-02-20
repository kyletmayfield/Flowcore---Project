import { describe, it, expect } from "vitest";
import { PLATFORM_DEFAULTS, getPlatformDefaults } from "../src/platform-defaults";

describe("platform-defaults", () => {
  it("defines all 4 platforms", () => {
    expect(Object.keys(PLATFORM_DEFAULTS)).toEqual([
      "instagram",
      "twitter",
      "linkedin",
      "facebook",
    ]);
  });

  it("twitter max_length is 280", () => {
    expect(PLATFORM_DEFAULTS.twitter.max_length).toBe(280);
  });

  it("instagram allows emoji", () => {
    expect(PLATFORM_DEFAULTS.instagram.emoji_allowed).toBe(true);
  });

  it("linkedin disallows emoji", () => {
    expect(PLATFORM_DEFAULTS.linkedin.emoji_allowed).toBe(false);
  });

  it("instagram hashtag range is 5-10", () => {
    expect(PLATFORM_DEFAULTS.instagram.hashtag_range).toEqual({ min: 5, max: 10 });
  });

  it("twitter hashtag range is 0-1", () => {
    expect(PLATFORM_DEFAULTS.twitter.hashtag_range).toEqual({ min: 0, max: 1 });
  });

  it("getPlatformDefaults returns correct platform", () => {
    const fb = getPlatformDefaults("facebook");
    expect(fb.platform).toBe("facebook");
    expect(fb.tone_modifier).toContain("community");
  });

  it("each platform has a structure_hint", () => {
    for (const [, defaults] of Object.entries(PLATFORM_DEFAULTS)) {
      expect(defaults.structure_hint).toBeTruthy();
      expect(typeof defaults.structure_hint).toBe("string");
    }
  });
});
