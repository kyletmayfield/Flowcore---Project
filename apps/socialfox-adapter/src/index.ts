// TheSocialFox Adapter — Public API
export { PLATFORM_DEFAULTS, getPlatformDefaults } from "./platform-defaults.js";
export { buildContentAnalysisPrompt, parseContentAnalysis } from "./content-analyzer.js";
export type { ContentAnalysis } from "./content-analyzer.js";
export { buildCaptionPrompt } from "./caption-generator.js";
export { calculateHeuristicConfidence } from "./confidence-heuristics.js";
export { needsAIAssessment, buildAssessmentPrompt, parseAssessmentResponse } from "./adaptive-assessment.js";
export { analyzeEdits, updatePlatformHistory } from "./persona-learner.js";
export { runGeneration, createMockSocialFoxAI } from "./orchestrator.js";
export type { AICallFn, GenerationRun, CaptionResult } from "./orchestrator.js";
