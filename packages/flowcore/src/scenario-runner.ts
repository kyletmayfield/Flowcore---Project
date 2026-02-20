import type {
  Workflow,
  TestInput,
  ScenarioResults,
  InputResult,
  EdgeCase,
  Grade,
  ExecutionRun,
} from "./types.js";
import { calculateGrade, getGradeColor } from "./grading.js";

/**
 * Aggregates results from multiple execution runs into a ScenarioResults object.
 * Human-in-the-loop is always disabled during batch testing.
 */
export function aggregateScenarioResults(
  runs: ExecutionRun[],
  testInputs: TestInput[]
): ScenarioResults {
  const gradeDistribution: Record<Grade, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  const perInput: InputResult[] = runs.map((run, index) => {
    const input = testInputs[index];
    const grade = run.trust_grade;
    gradeDistribution[grade]++;

    const dataPreview = JSON.stringify(input.data).slice(0, 80);
    const pathTaken = run.node_traces
      .filter((t) => t.edge_taken)
      .map((t) => t.edge_taken)
      .join(" → ");

    return {
      input_id: input.id,
      data_preview: dataPreview,
      path_taken: pathTaken,
      confidence: run.trust_score / 100,
      grade,
      color: getGradeColor(grade),
      human_override: false, // always false in batch mode
    };
  });

  const totalConfidence = perInput.reduce((sum, r) => sum + r.confidence, 0);
  const avgConfidence = perInput.length > 0 ? totalConfidence / perInput.length : 1;
  const overallScore = Math.round(avgConfidence * 100);
  const overallGrade = calculateGrade(avgConfidence);

  return {
    total: testInputs.length,
    completed: runs.length,
    failed: testInputs.length - runs.length,
    grade_distribution: gradeDistribution,
    overall_trust_score: overallScore,
    overall_trust_grade: overallGrade,
    per_input: perInput,
    edge_cases: [], // populated by AI edge case analyzer (separate call)
  };
}

/**
 * Builds the prompt for the AI edge case analyzer.
 * Sends low-confidence results to Claude for analysis.
 */
export function buildEdgeCaseAnalyzerPrompt(
  workflowDescription: string,
  lowConfidenceResults: InputResult[]
): string {
  return `You are reviewing the results of a batch test run on an AI workflow. Your job is to identify concerning patterns and provide actionable suggestions.

WORKFLOW DESCRIPTION:
${workflowDescription}

TEST RESULTS:
${JSON.stringify(lowConfidenceResults, null, 2)}

For each concerning result, provide:
{
    "edge_cases": [
        {
            "input_id": "<which test input>",
            "concern": "<what's concerning about this result>",
            "suggestion": "<specific, actionable advice to improve the workflow>"
        }
    ]
}

Focus on:
- Inputs where the AI grade was D or F
- Cases where the decision seems plausible but the confidence was low
- Patterns across multiple low-confidence results that suggest a systemic gap
- Practical suggestions: adding branches, rewording AI instructions, adding human review triggers`;
}

/**
 * Parses the edge case analyzer response.
 */
export function parseEdgeCaseResponse(raw: string): EdgeCase[] {
  const parsed = JSON.parse(raw);
  return (parsed.edge_cases ?? []).map((ec: Record<string, string>) => ({
    input_id: ec.input_id ?? "",
    concern: ec.concern ?? "",
    suggestion: ec.suggestion ?? "",
  }));
}
