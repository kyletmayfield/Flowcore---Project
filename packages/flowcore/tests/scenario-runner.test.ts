import { describe, it, expect } from "vitest";
import {
  aggregateScenarioResults,
  buildEdgeCaseAnalyzerPrompt,
  parseEdgeCaseResponse,
} from "../src/scenario-runner.js";
import type { ExecutionRun, TestInput } from "../src/types.js";

// --- Helpers ---

function makeRun(overrides: Partial<ExecutionRun> = {}): ExecutionRun {
  return {
    id: "exec_1",
    workflow_id: "wf_1",
    input: {},
    started_at: "2026-01-01T00:00:00Z",
    completed_at: "2026-01-01T00:00:01Z",
    status: "complete",
    trust_score: 90,
    trust_grade: "A",
    node_traces: [],
    ...overrides,
  };
}

function makeInput(id: string, data: Record<string, unknown>): TestInput {
  return { id, data, source: "manual" };
}

// --- aggregateScenarioResults ---

describe("aggregateScenarioResults", () => {
  it("aggregates a batch of runs into grade distribution", () => {
    const inputs: TestInput[] = [
      makeInput("t1", { message: "I love it" }),
      makeInput("t2", { message: "This is broken" }),
      makeInput("t3", { message: "Maybe refund?" }),
      makeInput("t4", { message: "lol ok 🙄" }),
    ];

    const runs: ExecutionRun[] = [
      makeRun({ id: "r1", trust_score: 94, trust_grade: "A" }),
      makeRun({ id: "r2", trust_score: 91, trust_grade: "A" }),
      makeRun({ id: "r3", trust_score: 62, trust_grade: "D" }),
      makeRun({ id: "r4", trust_score: 52, trust_grade: "F" }),
    ];

    const results = aggregateScenarioResults(runs, inputs);

    expect(results.total).toBe(4);
    expect(results.completed).toBe(4);
    expect(results.failed).toBe(0);
    expect(results.grade_distribution.A).toBe(2);
    expect(results.grade_distribution.D).toBe(1);
    expect(results.grade_distribution.F).toBe(1);
    expect(results.per_input).toHaveLength(4);
  });

  it("assigns correct colors to grades", () => {
    const inputs = [makeInput("t1", { msg: "hi" })];
    const runs = [makeRun({ trust_score: 52, trust_grade: "F" })];

    const results = aggregateScenarioResults(runs, inputs);
    expect(results.per_input[0].color).toBe("red");
  });

  it("always sets human_override to false in batch mode", () => {
    const inputs = [makeInput("t1", { msg: "hi" })];
    const runs = [makeRun({ trust_score: 52, trust_grade: "F" })];

    const results = aggregateScenarioResults(runs, inputs);
    expect(results.per_input[0].human_override).toBe(false);
  });

  it("handles empty runs", () => {
    const results = aggregateScenarioResults([], []);
    expect(results.total).toBe(0);
    expect(results.completed).toBe(0);
    expect(results.overall_trust_score).toBe(100);
    expect(results.overall_trust_grade).toBe("A");
  });

  it("starts with empty edge_cases (populated by separate AI call)", () => {
    const inputs = [makeInput("t1", { msg: "hi" })];
    const runs = [makeRun({ trust_score: 90, trust_grade: "A" })];

    const results = aggregateScenarioResults(runs, inputs);
    expect(results.edge_cases).toEqual([]);
  });
});

// --- buildEdgeCaseAnalyzerPrompt ---

describe("buildEdgeCaseAnalyzerPrompt", () => {
  it("includes workflow description and low-confidence results", () => {
    const prompt = buildEdgeCaseAnalyzerPrompt(
      "Support ticket triage workflow",
      [
        {
          input_id: "t4",
          data_preview: '"lol ok 🙄"',
          path_taken: "neutral → log",
          confidence: 0.52,
          grade: "F",
          color: "red",
          human_override: false,
        },
      ]
    );

    expect(prompt).toContain("Support ticket triage workflow");
    expect(prompt).toContain("t4");
    expect(prompt).toContain("grade was D or F");
  });
});

// --- parseEdgeCaseResponse ---

describe("parseEdgeCaseResponse", () => {
  it("parses a valid edge case response", () => {
    const raw = JSON.stringify({
      edge_cases: [
        {
          input_id: "t4",
          concern: "Sarcasm detection is unreliable.",
          suggestion: "Add a human review trigger for low-confidence classifications.",
        },
      ],
    });

    const cases = parseEdgeCaseResponse(raw);
    expect(cases).toHaveLength(1);
    expect(cases[0].input_id).toBe("t4");
    expect(cases[0].concern).toContain("Sarcasm");
  });

  it("handles empty edge_cases array", () => {
    const raw = JSON.stringify({ edge_cases: [] });
    expect(parseEdgeCaseResponse(raw)).toEqual([]);
  });

  it("handles missing edge_cases key", () => {
    const raw = JSON.stringify({});
    expect(parseEdgeCaseResponse(raw)).toEqual([]);
  });
});
