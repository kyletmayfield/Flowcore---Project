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

/**
 * Builds a prompt for Claude to generate diverse test inputs for a workflow.
 * The generated inputs include normal cases, edge cases, and adversarial inputs
 * to thoroughly stress-test the workflow's AI classification.
 */
export function buildTestCaseGeneratorPrompt(
  workflowDescription: string,
  nodeLabels: string[],
  existingCategories: string[],
  count: number
): string {
  return `You are a QA engineer generating diverse test inputs for an AI workflow. Your goal is to create inputs that thoroughly test the workflow's classification and routing logic.

WORKFLOW DESCRIPTION:
${workflowDescription}

WORKFLOW NODES:
${nodeLabels.map((label) => `- ${label}`).join("\n")}

EXISTING CLASSIFICATION CATEGORIES:
${existingCategories.length > 0 ? existingCategories.map((c) => `- ${c}`).join("\n") : "- (none specified)"}

Generate exactly ${count} diverse test inputs. Include a healthy mix of:
1. **Normal cases** — straightforward inputs that clearly match a category
2. **Ambiguous inputs** — messages that could reasonably belong to multiple categories
3. **Sarcastic / ironic** — inputs where tone contradicts literal meaning (e.g., "Oh great, another update that breaks everything")
4. **Multi-intent** — messages that contain multiple requests or sentiments in one
5. **Very short messages** — 1-5 word inputs (e.g., "help", "broken", "thanks")
6. **Very long messages** — detailed, multi-sentence inputs with context and backstory
7. **Edge cases** — empty-ish inputs, special characters, emoji-only, non-English fragments, ALL CAPS
8. **Adversarial** — inputs designed to confuse or trick the classifier

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "id": "gen_1",
    "label": "<short description of what this tests, e.g. 'sarcastic complaint'>",
    "data": { "message": "<the test input message>" }
  }
]

Each object must have:
- "id": string starting with "gen_" followed by a number (gen_1, gen_2, etc.)
- "label": a short human-readable label describing what category or edge case this input represents
- "data": an object with a "message" field containing the test input string

Ensure the inputs are realistic and varied. Do NOT repeat similar messages.`;
}

/**
 * Parses the raw AI response into an array of TestInput objects.
 * Handles cases where the response may be wrapped in markdown code fences
 * or contain extra whitespace.
 */
export function parseGeneratedTestCases(raw: string): TestInput[] {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of test cases");
  }

  return parsed.map(
    (item: Record<string, unknown>, index: number): TestInput => {
      const id =
        typeof item.id === "string" && item.id.length > 0
          ? item.id
          : `gen_${index + 1}`;
      const label =
        typeof item.label === "string" ? item.label : `Generated #${index + 1}`;
      const data =
        typeof item.data === "object" && item.data !== null
          ? (item.data as Record<string, unknown>)
          : { message: String(item.data ?? "") };

      return {
        id,
        label,
        data,
        source: "ai_generated" as const,
      };
    }
  );
}
