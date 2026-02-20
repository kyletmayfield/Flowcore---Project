import type {
  Grade,
  WorkflowSettings,
  ReasoningTrace,
  HumanReviewRequest,
  HumanReviewResponse,
} from "./types.js";

/**
 * Determines whether a human review should be triggered
 * based on the AI's grade and workflow settings.
 *
 * Human review triggers when ALL of these are true:
 * 1. human_review_mode is "pause_on_fail"
 * 2. The AI node returned grade F (confidence < 59%)
 * 3. The workflow is in interactive mode (not batch testing)
 */
export function shouldTriggerHumanReview(
  grade: Grade,
  settings: WorkflowSettings,
  isBatchTesting: boolean
): boolean {
  if (isBatchTesting) return false;
  if (settings.human_review_mode !== "pause_on_fail") return false;
  return grade === "F";
}

/**
 * Creates a human review request object containing
 * all the information the UI needs to display the review prompt.
 */
export function createReviewRequest(
  executionId: string,
  nodeId: string,
  aiDecision: string,
  aiConfidence: number,
  aiGrade: Grade,
  reasoning: ReasoningTrace,
  availableOptions: string[],
  timeoutSeconds: number
): HumanReviewRequest {
  return {
    execution_id: executionId,
    node_id: nodeId,
    ai_decision: aiDecision,
    ai_confidence: aiConfidence,
    ai_grade: aiGrade,
    reasoning,
    available_options: availableOptions,
    timeout_seconds: timeoutSeconds,
  };
}

/**
 * Resolves a human review — either the user selected an option
 * or the timer expired (null selection = AI's original pick stands).
 */
export function resolveReview(
  selectedOption: string | null
): HumanReviewResponse {
  const now = new Date().toISOString();
  return {
    selected_option: selectedOption,
    responded_at: selectedOption !== null ? now : null,
    timed_out: selectedOption === null,
  };
}
