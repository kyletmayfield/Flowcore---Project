import { describe, it, expect } from "vitest";
import { calculateGrade, getGradeColor, calculateWorkflowGrade } from "../src/grading.js";
import type { NodeTrace } from "../src/types.js";

describe("calculateGrade", () => {
  it("returns A for 90-100%", () => {
    expect(calculateGrade(0.9)).toBe("A");
    expect(calculateGrade(0.95)).toBe("A");
    expect(calculateGrade(1.0)).toBe("A");
  });

  it("returns B for 80-89%", () => {
    expect(calculateGrade(0.8)).toBe("B");
    expect(calculateGrade(0.85)).toBe("B");
    expect(calculateGrade(0.89)).toBe("B");
  });

  it("returns C for 70-79%", () => {
    expect(calculateGrade(0.7)).toBe("C");
    expect(calculateGrade(0.75)).toBe("C");
  });

  it("returns D for 60-69%", () => {
    expect(calculateGrade(0.6)).toBe("D");
    expect(calculateGrade(0.65)).toBe("D");
  });

  it("returns F for 0-59%", () => {
    expect(calculateGrade(0.59)).toBe("F");
    expect(calculateGrade(0.5)).toBe("F");
    expect(calculateGrade(0.0)).toBe("F");
  });
});

describe("getGradeColor", () => {
  it("maps grades to correct colors", () => {
    expect(getGradeColor("A")).toBe("green");
    expect(getGradeColor("B")).toBe("blue");
    expect(getGradeColor("C")).toBe("yellow");
    expect(getGradeColor("D")).toBe("orange");
    expect(getGradeColor("F")).toBe("red");
  });
});

describe("calculateWorkflowGrade", () => {
  it("returns A/100 when no AI nodes exist", () => {
    const traces: NodeTrace[] = [
      { node_id: "t1", input: {}, output: {}, duration_ms: 10 },
    ];
    const result = calculateWorkflowGrade(traces);
    expect(result.score).toBe(100);
    expect(result.grade).toBe("A");
  });

  it("averages confidence across AI nodes", () => {
    const traces: NodeTrace[] = [
      { node_id: "t1", input: {}, output: {}, duration_ms: 10 },
      { node_id: "ai1", input: {}, output: {}, confidence: 0.9, grade: "A", duration_ms: 100 },
      { node_id: "ai2", input: {}, output: {}, confidence: 0.7, grade: "C", duration_ms: 120 },
    ];
    const result = calculateWorkflowGrade(traces);
    // avg = (0.9 + 0.7) / 2 = 0.8 → 80 → B
    expect(result.score).toBe(80);
    expect(result.grade).toBe("B");
  });

  it("handles single low-confidence AI node", () => {
    const traces: NodeTrace[] = [
      { node_id: "ai1", input: {}, output: {}, confidence: 0.52, grade: "F", duration_ms: 100 },
    ];
    const result = calculateWorkflowGrade(traces);
    expect(result.score).toBe(52);
    expect(result.grade).toBe("F");
  });
});
