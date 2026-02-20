import { useState, useCallback } from "react";
import type { Persona, Platform, TraceDepth, PlatformHistory } from "@flowcore/engine";
import type { GenerationRun, CaptionResult } from "socialfox-adapter";
import { runGeneration, createMockSocialFoxAI, analyzeEdits, updatePlatformHistory } from "socialfox-adapter";

const DEMO_PERSONA: Persona = {
  id: "p_demo",
  user_id: "u_demo",
  name: "Artisan Coffee Co.",
  voice: "warm, craft-focused, community-driven",
  vocabulary: "artisan, handcrafted, sourced, roasted, community, ritual",
  values: ["quality craftsmanship", "sustainability", "community connection"],
  learned_preferences: {
    instagram: {
      generation_count: 32,
      avg_edits_per_generation: 0.7,
      common_edits: ["shorter_content", "more_emoji"],
      selection_patterns: ["prefers_question_hooks", "favors_storytelling"],
      avg_confidence: 0.84,
      adaptive_ai_active: false,
    },
    linkedin: {
      generation_count: 12,
      avg_edits_per_generation: 0.3,
      common_edits: ["add_industry_stats"],
      selection_patterns: ["prefers_insight_driven"],
      avg_confidence: 0.78,
      adaptive_ai_active: false,
    },
    twitter: {
      generation_count: 3,
      avg_edits_per_generation: 1.5,
      common_edits: [],
      selection_patterns: [],
      avg_confidence: 0.52,
      adaptive_ai_active: true,
    },
  },
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-02-20T00:00:00Z",
};

const ALL_PLATFORMS: Platform[] = ["instagram", "twitter", "linkedin", "facebook"];

const mockAI = createMockSocialFoxAI();

export interface SocialFoxState {
  persona: Persona;
  selectedPlatforms: Platform[];
  userContext: string;
  hasImage: boolean;
  traceDepth: TraceDepth;
  advancedView: boolean;
  isGenerating: boolean;
  generationRun: GenerationRun | null;
  selections: Record<Platform, boolean>;
  edits: Record<Platform, string>;
  generationHistory: GenerationRun[];
}

export function useSocialFoxStore() {
  const [persona, setPersona] = useState<Persona>(DEMO_PERSONA);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(ALL_PLATFORMS);
  const [userContext, setUserContext] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [traceDepth, setTraceDepth] = useState<TraceDepth>("full");
  const [advancedView, setAdvancedView] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationRun, setGenerationRun] = useState<GenerationRun | null>(null);
  const [selections, setSelections] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [generationHistory, setGenerationHistory] = useState<GenerationRun[]>([]);

  const generate = useCallback(async () => {
    if (!userContext.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setSelections({});
    setEdits({});

    try {
      // Build recent confidences from persona history for adaptive AI check
      const recentConfidences: Record<Platform, number[]> = {
        instagram: [],
        twitter: [],
        linkedin: [],
        facebook: [],
      };
      for (const p of selectedPlatforms) {
        const hist = persona.learned_preferences[p];
        if (hist && hist.avg_confidence) {
          // Simulate a rolling window of recent confidences
          const count = Math.min(hist.generation_count, 10);
          for (let i = 0; i < count; i++) {
            recentConfidences[p].push(hist.avg_confidence + (Math.random() - 0.5) * 0.1);
          }
        }
      }

      const result = await runGeneration(
        persona,
        selectedPlatforms,
        userContext,
        hasImage,
        traceDepth,
        mockAI,
        recentConfidences
      );

      setGenerationRun(result);
      setGenerationHistory((prev) => [result, ...prev].slice(0, 20));

      // Pre-fill edits with generated captions
      const initialEdits: Record<string, string> = {};
      for (const [platform, captionResult] of Object.entries(result.results) as [string, CaptionResult][]) {
        initialEdits[platform] = captionResult.caption;
      }
      setEdits(initialEdits);
    } finally {
      setIsGenerating(false);
    }
  }, [persona, selectedPlatforms, userContext, hasImage, traceDepth]);

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const selectCaption = useCallback(
    (platform: Platform) => {
      setSelections((prev) => ({ ...prev, [platform]: !prev[platform] }));

      // Learning loop: when user selects, update persona
      if (generationRun) {
        const original = generationRun.results[platform]?.caption ?? "";
        const edited = edits[platform] ?? original;
        const editPatterns = analyzeEdits(original, edited);
        const currentHistory = persona.learned_preferences[platform];
        const updatedHistory = updatePlatformHistory(currentHistory, true, editPatterns);

        setPersona((prev) => ({
          ...prev,
          learned_preferences: {
            ...prev.learned_preferences,
            [platform]: updatedHistory,
          },
          updated_at: new Date().toISOString(),
        }));
      }
    },
    [generationRun, edits, persona]
  );

  const updateEdit = useCallback((platform: Platform, value: string) => {
    setEdits((prev) => ({ ...prev, [platform]: value }));
  }, []);

  return {
    persona,
    selectedPlatforms,
    userContext,
    hasImage,
    traceDepth,
    advancedView,
    isGenerating,
    generationRun,
    selections,
    edits,
    generationHistory,
    setUserContext,
    setHasImage,
    setTraceDepth,
    setAdvancedView,
    togglePlatform,
    generate,
    selectCaption,
    updateEdit,
  };
}
