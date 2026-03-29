import type { Grade, GradeColor, NodeTrace } from "./types.js";

/**
 * Converts a confidence score (0.00–1.00) to a letter grade.
 *
 * Grade scale:
 *   A = 90–100%  (high confidence)
 *   B = 80–89%   (good confidence)
 *   C = 70–79%   (moderate confidence)
 *   D = 60–69%   (low confidence)
 *   F = 0–59%    (failing — triggers human review if enabled)
 */
export function calculateGrade(confidence: number): Grade {
  const percentage = Math.round(confidence * 100);
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

/**
 * Returns the display color for a given grade.
 */
export function getGradeColor(grade: Grade): GradeColor {
  const colors: Record<Grade, GradeColor> = {
    A: "green",
    B: "blue",
    C: "yellow",
    D: "orange",
    F: "red",
  };
  return colors[grade];
}

/**
 * Calculates the workflow trust score from an array of node traces.
 * The trust score is the average confidence of all AI nodes in the run.
 * Returns both a numeric score (0–100) and a letter grade.
 */
export function calculateWorkflowGrade(
  nodeTraces: NodeTrace[]
): { score: number; grade: Grade } {
  const aiNodes = nodeTraces.filter(
    (t) => t.confidence !== undefined
  );

  if (aiNodes.length === 0) {
    return { score: 100, grade: "A" };
  }

  const avgConfidence =
    aiNodes.reduce((sum, n) => sum + (n.confidence ?? 0), 0) / aiNodes.length;
  const score = Math.round(avgConfidence * 100);
  const grade = calculateGrade(avgConfidence);

  return { score, grade };
}
