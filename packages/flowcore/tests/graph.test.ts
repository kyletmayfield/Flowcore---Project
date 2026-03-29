import { describe, it, expect } from "vitest";
import {
  findTriggerNode,
  getNode,
  getOutgoingEdges,
  evaluateCondition,
  findBestMatchingEdge,
} from "../src/graph.js";
import type { Workflow, WorkflowEdge, EdgeCondition } from "../src/types.js";

// --- Helpers ---

function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: "wf_1",
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

// --- findTriggerNode ---

describe("findTriggerNode", () => {
  it("returns the trigger node when exactly one exists", () => {
    const wf = makeWorkflow({
      nodes: [
        { id: "t1", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Start" } },
        { id: "ai1", type: "ai", subtype: "classifier", position: { x: 100, y: 0 }, config: { label: "Classify" } },
      ],
    });
    const trigger = findTriggerNode(wf);
    expect(trigger.id).toBe("t1");
    expect(trigger.type).toBe("trigger");
  });

  it("throws when no trigger node exists", () => {
    const wf = makeWorkflow({
      nodes: [
        { id: "ai1", type: "ai", subtype: "classifier", position: { x: 0, y: 0 }, config: { label: "Classify" } },
      ],
    });
    expect(() => findTriggerNode(wf)).toThrow("no trigger node");
  });

  it("throws when multiple trigger nodes exist", () => {
    const wf = makeWorkflow({
      nodes: [
        { id: "t1", type: "trigger", subtype: "manual", position: { x: 0, y: 0 }, config: { label: "Start 1" } },
        { id: "t2", type: "trigger", subtype: "webhook", position: { x: 100, y: 0 }, config: { label: "Start 2" } },
      ],
    });
    expect(() => findTriggerNode(wf)).toThrow("multiple trigger nodes");
  });
});

// --- getNode ---

describe("getNode", () => {
  it("returns the node with matching ID", () => {
    const wf = makeWorkflow({
      nodes: [
        { id: "n1", type: "ai", subtype: "classifier", position: { x: 0, y: 0 }, config: { label: "Node 1" } },
        { id: "n2", type: "action", subtype: "logger", position: { x: 100, y: 0 }, config: { label: "Node 2" } },
      ],
    });
    expect(getNode(wf, "n2").config.label).toBe("Node 2");
  });

  it("throws when node is not found", () => {
    const wf = makeWorkflow({ nodes: [] });
    expect(() => getNode(wf, "missing")).toThrow("Node not found: missing");
  });
});

// --- getOutgoingEdges ---

describe("getOutgoingEdges", () => {
  it("returns all edges with the given source", () => {
    const wf = makeWorkflow({
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n1", target: "n3" },
        { id: "e3", source: "n2", target: "n4" },
      ],
    });
    const edges = getOutgoingEdges(wf, "n1");
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  it("returns empty array when no outgoing edges exist", () => {
    const wf = makeWorkflow({
      edges: [{ id: "e1", source: "n2", target: "n3" }],
    });
    expect(getOutgoingEdges(wf, "n1")).toEqual([]);
  });
});

// --- evaluateCondition ---

describe("evaluateCondition", () => {
  it("evaluates 'equals' with matching string", () => {
    const cond: EdgeCondition = { field: "decision", operator: "equals", value: "positive" };
    expect(evaluateCondition(cond, { decision: "positive" })).toBe(true);
  });

  it("evaluates 'equals' with non-matching string", () => {
    const cond: EdgeCondition = { field: "decision", operator: "equals", value: "positive" };
    expect(evaluateCondition(cond, { decision: "negative" })).toBe(false);
  });

  it("evaluates 'contains' with matching substring", () => {
    const cond: EdgeCondition = { field: "text", operator: "contains", value: "hello" };
    expect(evaluateCondition(cond, { text: "say hello world" })).toBe(true);
  });

  it("evaluates 'contains' with non-matching substring", () => {
    const cond: EdgeCondition = { field: "text", operator: "contains", value: "goodbye" };
    expect(evaluateCondition(cond, { text: "say hello world" })).toBe(false);
  });

  it("evaluates 'greater_than' with numbers", () => {
    const cond: EdgeCondition = { field: "score", operator: "greater_than", value: 50 };
    expect(evaluateCondition(cond, { score: 75 })).toBe(true);
    expect(evaluateCondition(cond, { score: 25 })).toBe(false);
    expect(evaluateCondition(cond, { score: 50 })).toBe(false); // not greater, equal
  });

  it("evaluates 'less_than' with numbers", () => {
    const cond: EdgeCondition = { field: "score", operator: "less_than", value: 50 };
    expect(evaluateCondition(cond, { score: 25 })).toBe(true);
    expect(evaluateCondition(cond, { score: 75 })).toBe(false);
  });

  it("returns false when field is missing from output", () => {
    const cond: EdgeCondition = { field: "missing", operator: "equals", value: "x" };
    expect(evaluateCondition(cond, { decision: "x" })).toBe(false);
  });

  it("returns false for type mismatch (string field with greater_than)", () => {
    const cond: EdgeCondition = { field: "decision", operator: "greater_than", value: 5 };
    expect(evaluateCondition(cond, { decision: "positive" })).toBe(false);
  });
});

// --- findBestMatchingEdge ---

describe("findBestMatchingEdge", () => {
  it("returns the first matching conditional edge", () => {
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "n1", target: "n2", condition: { field: "decision", operator: "equals", value: "positive" } },
      { id: "e2", source: "n1", target: "n3", condition: { field: "decision", operator: "equals", value: "negative" } },
    ];
    const result = findBestMatchingEdge(edges, { decision: "negative" });
    expect(result.id).toBe("e2");
  });

  it("falls back to unconditional edge when no condition matches", () => {
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "n1", target: "n2", condition: { field: "decision", operator: "equals", value: "positive" } },
      { id: "e_default", source: "n1", target: "n4" }, // unconditional
    ];
    const result = findBestMatchingEdge(edges, { decision: "unknown" });
    expect(result.id).toBe("e_default");
  });

  it("falls back to first edge when nothing matches and no unconditional", () => {
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "n1", target: "n2", condition: { field: "decision", operator: "equals", value: "positive" } },
      { id: "e2", source: "n1", target: "n3", condition: { field: "decision", operator: "equals", value: "negative" } },
    ];
    const result = findBestMatchingEdge(edges, { decision: "unknown" });
    expect(result.id).toBe("e1"); // first edge as last resort
  });
});
