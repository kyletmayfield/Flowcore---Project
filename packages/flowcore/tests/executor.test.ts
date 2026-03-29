import { describe, it, expect, vi } from "vitest";
import { executeWorkflow } from "../src/executor.js";
import type { Workflow, WorkflowNode, ReasoningTrace } from "../src/types.js";
import type { AIExecutor, HumanReviewHandler } from "../src/executor.js";

// --- Test helpers ---

function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: "wf_test",
    name: "Test Workflow",
    description: "test",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    nodes: [],
    edges: [],
    settings: {
      human_review_mode: "auto_accept",
      review_timeout_seconds: 30,
      default_trace_depth: "full",
    },
    ...overrides,
  };
}

const mockReasoning: ReasoningTrace = {
  summary: "Test reasoning.",
  factors: [{ factor: "test", observation: "test obs", weight: "high" }],
  alternatives_considered: [],
};

// --- LINEAR WORKFLOW ---

describe("executeWorkflow — linear", () => {
  it("executes a simple trigger → AI → action workflow", async () => {
    const workflow = makeWorkflow({
      nodes: [
        { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
        { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Classify", instruction: "Classify sentiment", output_schema: ["positive", "negative"] } },
        { id: "action1", type: "action", subtype: "logger", position: { x: 200, y: 0 }, config: { label: "Log" } },
      ],
      edges: [
        { id: "e1", source: "trigger", target: "ai1" },
        { id: "e2", source: "ai1", target: "action1" },
      ],
    });

    const aiExecutor: AIExecutor = async (_node, _payload) => ({
      output: { decision: "positive" },
      reasoning: mockReasoning,
      confidence: 0.92,
      duration_ms: 150,
    });

    const result = await executeWorkflow({
      workflow,
      input: { message: "I love this!" },
      aiExecutor,
    });

    expect(result.status).toBe("complete");
    expect(result.trust_grade).toBe("A");
    expect(result.trust_score).toBe(92);
    expect(result.node_traces).toHaveLength(3);

    // Trigger node
    expect(result.node_traces[0].node_id).toBe("trigger");
    expect(result.node_traces[0].edge_taken).toBe("e1");

    // AI node
    expect(result.node_traces[1].node_id).toBe("ai1");
    expect(result.node_traces[1].confidence).toBe(0.92);
    expect(result.node_traces[1].grade).toBe("A");
    expect(result.node_traces[1].reasoning?.summary).toBe("Test reasoning.");
    expect(result.node_traces[1].edge_taken).toBe("e2");

    // Action node (terminal)
    expect(result.node_traces[2].node_id).toBe("action1");
    expect(result.node_traces[2].edge_taken).toBeUndefined();
  });

  it("handles a single trigger node (no other nodes)", async () => {
    const workflow = makeWorkflow({
      nodes: [
        { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
      ],
      edges: [],
    });

    const result = await executeWorkflow({
      workflow,
      input: { text: "hello" },
      aiExecutor: async () => ({ output: {}, duration_ms: 0 }),
    });

    expect(result.status).toBe("complete");
    expect(result.node_traces).toHaveLength(1);
    expect(result.trust_score).toBe(100); // no AI nodes = perfect
    expect(result.trust_grade).toBe("A");
  });

  it("passes output from one node as input to the next", async () => {
    const workflow = makeWorkflow({
      nodes: [
        { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
        { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Classify" } },
        { id: "action1", type: "action", subtype: "logger", position: { x: 200, y: 0 }, config: { label: "Log" } },
      ],
      edges: [
        { id: "e1", source: "trigger", target: "ai1" },
        { id: "e2", source: "ai1", target: "action1" },
      ],
    });

    const aiExecutor: AIExecutor = async (_node, payload) => {
      // Verify the AI node receives the original input
      expect(payload).toHaveProperty("message", "test input");
      return {
        output: { decision: "classified", original: payload.message },
        confidence: 0.85,
        duration_ms: 100,
      };
    };

    const result = await executeWorkflow({
      workflow,
      input: { message: "test input" },
      aiExecutor,
    });

    // The action node should receive the AI's output
    expect(result.node_traces[2].input).toHaveProperty("decision", "classified");
  });
});

// --- BRANCHING WORKFLOW ---

describe("executeWorkflow — branching", () => {
  const branchingWorkflow = makeWorkflow({
    nodes: [
      { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
      { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Sentiment", output_schema: ["positive", "negative", "neutral"] } },
      { id: "thanks", type: "action", subtype: "notification", position: { x: 200, y: -50 }, config: { label: "Send Thanks" } },
      { id: "ticket", type: "action", subtype: "notification", position: { x: 200, y: 0 }, config: { label: "Create Ticket" } },
      { id: "log", type: "action", subtype: "logger", position: { x: 200, y: 50 }, config: { label: "Log & Skip" } },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "ai1" },
      { id: "e_pos", source: "ai1", target: "thanks", condition: { field: "decision", operator: "equals", value: "positive" } },
      { id: "e_neg", source: "ai1", target: "ticket", condition: { field: "decision", operator: "equals", value: "negative" } },
      { id: "e_neu", source: "ai1", target: "log", condition: { field: "decision", operator: "equals", value: "neutral" } },
    ],
  });

  it("follows the positive branch", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "positive" },
      confidence: 0.94,
      duration_ms: 120,
    });

    const result = await executeWorkflow({
      workflow: branchingWorkflow,
      input: { message: "I love your product!" },
      aiExecutor,
    });

    expect(result.node_traces).toHaveLength(3);
    expect(result.node_traces[1].edge_taken).toBe("e_pos");
    expect(result.node_traces[2].node_id).toBe("thanks");
    expect(result.trust_grade).toBe("A");
  });

  it("follows the negative branch", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "negative" },
      confidence: 0.87,
      duration_ms: 130,
    });

    const result = await executeWorkflow({
      workflow: branchingWorkflow,
      input: { message: "This is broken and I'm furious" },
      aiExecutor,
    });

    expect(result.node_traces[1].edge_taken).toBe("e_neg");
    expect(result.node_traces[2].node_id).toBe("ticket");
  });

  it("follows the neutral branch", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.71,
      duration_ms: 110,
    });

    const result = await executeWorkflow({
      workflow: branchingWorkflow,
      input: { message: "ok thanks" },
      aiExecutor,
    });

    expect(result.node_traces[1].edge_taken).toBe("e_neu");
    expect(result.node_traces[2].node_id).toBe("log");
    expect(result.trust_grade).toBe("C");
  });

  it("falls back to first edge when no condition matches", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "unknown_value" },
      confidence: 0.45,
      duration_ms: 100,
    });

    const result = await executeWorkflow({
      workflow: branchingWorkflow,
      input: { message: "🙄" },
      aiExecutor,
    });

    // Falls back to first conditional edge
    expect(result.node_traces[1].edge_taken).toBe("e_pos");
    expect(result.trust_grade).toBe("F");
  });
});

// --- F-GRADE HANDLING & HUMAN-IN-THE-LOOP ---

describe("executeWorkflow — human-in-the-loop", () => {
  const hitlWorkflow = makeWorkflow({
    nodes: [
      { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
      { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Classify", output_schema: ["positive", "negative", "neutral"] } },
      { id: "thanks", type: "action", subtype: "notification", position: { x: 200, y: -50 }, config: { label: "Send Thanks" } },
      { id: "ticket", type: "action", subtype: "notification", position: { x: 200, y: 0 }, config: { label: "Create Ticket" } },
      { id: "log", type: "action", subtype: "logger", position: { x: 200, y: 50 }, config: { label: "Log" } },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "ai1" },
      { id: "e_pos", source: "ai1", target: "thanks", condition: { field: "decision", operator: "equals", value: "positive" } },
      { id: "e_neg", source: "ai1", target: "ticket", condition: { field: "decision", operator: "equals", value: "negative" } },
      { id: "e_neu", source: "ai1", target: "log", condition: { field: "decision", operator: "equals", value: "neutral" } },
    ],
    settings: {
      human_review_mode: "pause_on_fail",
      review_timeout_seconds: 30,
      default_trace_depth: "full",
    },
  });

  it("triggers human review on F grade and applies override", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.52,
      duration_ms: 100,
    });

    const humanReviewHandler: HumanReviewHandler = vi.fn(async () => "negative");

    const result = await executeWorkflow({
      workflow: hitlWorkflow,
      input: { message: "lol ok whatever 🙄" },
      aiExecutor,
      humanReviewHandler,
    });

    // Human overrode to "negative"
    expect(humanReviewHandler).toHaveBeenCalledOnce();
    expect(result.node_traces[1].human_override).toBe(true);
    expect(result.node_traces[1].edge_taken).toBe("e_neg");
    expect(result.node_traces[2].node_id).toBe("ticket");
    expect(result.status).toBe("human_override");
  });

  it("uses AI choice when human times out (returns null)", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.52,
      duration_ms: 100,
    });

    const humanReviewHandler: HumanReviewHandler = vi.fn(async () => null);

    const result = await executeWorkflow({
      workflow: hitlWorkflow,
      input: { message: "meh" },
      aiExecutor,
      humanReviewHandler,
    });

    // Human timed out, AI's choice stands
    expect(humanReviewHandler).toHaveBeenCalledOnce();
    expect(result.node_traces[1].human_override).toBeUndefined();
    expect(result.node_traces[1].edge_taken).toBe("e_neu");
    expect(result.node_traces[2].node_id).toBe("log");
    expect(result.status).toBe("complete");
  });

  it("does NOT trigger human review in auto_accept mode", async () => {
    const autoWorkflow = {
      ...hitlWorkflow,
      settings: {
        ...hitlWorkflow.settings,
        human_review_mode: "auto_accept" as const,
      },
    };

    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.52,
      duration_ms: 100,
    });

    const humanReviewHandler: HumanReviewHandler = vi.fn(async () => "negative");

    const result = await executeWorkflow({
      workflow: autoWorkflow,
      input: { message: "🙄" },
      aiExecutor,
      humanReviewHandler,
    });

    expect(humanReviewHandler).not.toHaveBeenCalled();
    expect(result.node_traces[1].human_override).toBeUndefined();
  });

  it("does NOT trigger human review during batch testing", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.52,
      duration_ms: 100,
    });

    const humanReviewHandler: HumanReviewHandler = vi.fn(async () => "negative");

    const result = await executeWorkflow({
      workflow: hitlWorkflow,
      input: { message: "🙄" },
      aiExecutor,
      humanReviewHandler,
      isBatchTesting: true,
    });

    expect(humanReviewHandler).not.toHaveBeenCalled();
  });

  it("does NOT trigger human review for non-F grades", async () => {
    const aiExecutor: AIExecutor = async () => ({
      output: { decision: "neutral" },
      confidence: 0.65, // D grade, not F
      duration_ms: 100,
    });

    const humanReviewHandler: HumanReviewHandler = vi.fn(async () => "negative");

    const result = await executeWorkflow({
      workflow: hitlWorkflow,
      input: { message: "maybe" },
      aiExecutor,
      humanReviewHandler,
    });

    expect(humanReviewHandler).not.toHaveBeenCalled();
    expect(result.node_traces[1].grade).toBe("D");
  });
});

// --- TRUST SCORE ---

describe("executeWorkflow — trust score", () => {
  it("calculates trust score as average of all AI node confidences", async () => {
    const workflow = makeWorkflow({
      nodes: [
        { id: "trigger", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Input" } },
        { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Step 1" } },
        { id: "ai2", type: "ai", subtype: "classifier", position: { x: 200, y: 0 }, config: { label: "Step 2" } },
        { id: "action", type: "action", subtype: "logger", position: { x: 300, y: 0 }, config: { label: "Log" } },
      ],
      edges: [
        { id: "e1", source: "trigger", target: "ai1" },
        { id: "e2", source: "ai1", target: "ai2" },
        { id: "e3", source: "ai2", target: "action" },
      ],
    });

    let callCount = 0;
    const aiExecutor: AIExecutor = async () => {
      callCount++;
      const confidence = callCount === 1 ? 0.9 : 0.7;
      return {
        output: { decision: "result" },
        confidence,
        duration_ms: 100,
      };
    };

    const result = await executeWorkflow({
      workflow,
      input: { data: "test" },
      aiExecutor,
    });

    // avg = (0.9 + 0.7) / 2 = 0.8 → 80 → B
    expect(result.trust_score).toBe(80);
    expect(result.trust_grade).toBe("B");
  });
});
