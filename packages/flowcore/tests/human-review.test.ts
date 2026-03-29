import { describe, it, expect } from "vitest";
import {
  shouldTriggerHumanReview,
  createReviewRequest,
  resolveReview,
} from "../src/human-review.js";
import type { WorkflowSettings, ReasoningTrace } from "../src/types.js";

describe("shouldTriggerHumanReview", () => {
  const pauseSettings: WorkflowSettings = {
    human_review_mode: "pause_on_fail",
    review_timeout_seconds: 30,
    default_trace_depth: "full",
  };

  const autoSettings: WorkflowSettings = {
    human_review_mode: "auto_accept",
    review_timeout_seconds: 30,
    default_trace_depth: "full",
  };

  it("triggers on F grade with pause_on_fail in interactive mode", () => {
    expect(shouldTriggerHumanReview("F", pauseSettings, false)).toBe(true);
  });

  it("does NOT trigger on D grade (only F triggers)", () => {
    expect(shouldTriggerHumanReview("D", pauseSettings, false)).toBe(false);
  });

  it("does NOT trigger on A grade", () => {
    expect(shouldTriggerHumanReview("A", pauseSettings, false)).toBe(false);
  });

  it("does NOT trigger during batch testing (even on F)", () => {
    expect(shouldTriggerHumanReview("F", pauseSettings, true)).toBe(false);
  });

  it("does NOT trigger in auto_accept mode (even on F)", () => {
    expect(shouldTriggerHumanReview("F", autoSettings, false)).toBe(false);
  });
});

describe("createReviewRequest", () => {
  it("creates a properly structured review request", () => {
    const reasoning: ReasoningTrace = {
      summary: "Uncertain classification.",
      factors: [],
      alternatives_considered: [],
    };

    const req = createReviewRequest(
      "exec_1",
      "node_1",
      "neutral",
      0.52,
      "F",
      reasoning,
      ["positive", "negative", "neutral"],
      30
    );

    expect(req.execution_id).toBe("exec_1");
    expect(req.node_id).toBe("node_1");
    expect(req.ai_decision).toBe("neutral");
    expect(req.ai_confidence).toBe(0.52);
    expect(req.ai_grade).toBe("F");
    expect(req.available_options).toEqual(["positive", "negative", "neutral"]);
    expect(req.timeout_seconds).toBe(30);
  });
});

describe("resolveReview", () => {
  it("records user selection (not timed out)", () => {
    const result = resolveReview("negative");
    expect(result.selected_option).toBe("negative");
    expect(result.timed_out).toBe(false);
    expect(result.responded_at).toBeTruthy();
  });

  it("records timeout (null selection)", () => {
    const result = resolveReview(null);
    expect(result.selected_option).toBeNull();
    expect(result.timed_out).toBe(true);
    expect(result.responded_at).toBeNull();
  });
});
