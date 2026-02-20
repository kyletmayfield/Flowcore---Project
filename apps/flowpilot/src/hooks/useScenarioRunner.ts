import { useState, useCallback } from "react";
import {
  executeWorkflow,
  buildEdgeCaseAnalyzerPrompt,
  parseEdgeCaseResponse,
  type Workflow,
  type WorkflowSettings,
  type Grade,
} from "@flowcore/engine";
import type { AIExecutor } from "@flowcore/engine";
import type { ScenarioInput } from "../components/ScenarioTest/ScenarioTestPanel";
import type { ScenarioResultData, EdgeCase } from "../components/ScenarioTest/ScenarioResults";
import { callClaude } from "../lib/claude";

interface ScenarioRunnerDeps {
  workflow: Workflow;
  settings: WorkflowSettings;
  aiExecutor: AIExecutor;
}

export function useScenarioRunner(deps: ScenarioRunnerDeps) {
  const { workflow, settings, aiExecutor } = deps;
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ScenarioResultData[]>([]);
  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const runScenario = useCallback(
    async (inputs: ScenarioInput[]) => {
      setIsRunning(true);
      setResults([]);
      setEdgeCases([]);
      setProgress({ current: 0, total: inputs.length });

      const allResults: ScenarioResultData[] = [];

      // Run sequentially with small delay (rate limiting)
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        setProgress({ current: i + 1, total: inputs.length });

        try {
          const workflowWithSettings: Workflow = {
            ...workflow,
            settings,
          };

          const run = await executeWorkflow({
            workflow: workflowWithSettings,
            input: input.data,
            aiExecutor,
            isBatchTesting: true, // HITL disabled
          });

          const aiTrace = run.node_traces.find((t) => t.confidence !== undefined);
          const decision = (aiTrace?.output as any)?.decision ?? "\u2014";

          allResults.push({
            inputId: input.id,
            inputPreview: String(
              (input.data as any).message ?? JSON.stringify(input.data)
            ).slice(0, 80),
            decision,
            pathTaken: run.node_traces
              .filter((t) => t.edge_taken)
              .map((t) => t.edge_taken)
              .join(" \u2192 "),
            confidence: aiTrace?.confidence ?? 0,
            grade: run.trust_grade,
            status: run.status,
            run,
          });

          setResults([...allResults]);
        } catch (err) {
          console.error(`Scenario input ${input.id} failed:`, err);
        }

        // Rate limiting: small delay between runs
        if (i < inputs.length - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      // Generate edge cases from D and F results
      const lowConfidence = allResults.filter(
        (r) => r.grade === "D" || r.grade === "F"
      );

      if (lowConfidence.length > 0) {
        // Try AI-powered edge case analysis first
        try {
          const prompt = buildEdgeCaseAnalyzerPrompt(
            workflow.description || workflow.name,
            lowConfidence.map((r) => ({
              input_id: r.inputId,
              data_preview: r.inputPreview,
              path_taken: r.pathTaken,
              confidence: r.confidence,
              grade: r.grade as Grade,
              color: r.grade === "F" ? "red" : "orange",
              human_override: false,
            }))
          );

          const raw = await callClaude(prompt);
          const aiEdgeCases = parseEdgeCaseResponse(raw);
          // Map engine EdgeCase (input_id) to component EdgeCase (inputId)
          setEdgeCases(aiEdgeCases.map((ec) => ({
            inputId: ec.input_id,
            concern: ec.concern,
            suggestion: ec.suggestion,
          })));
        } catch {
          // Fallback: generate edge cases with simple heuristics
          const heuristicEdgeCases: EdgeCase[] = lowConfidence.map((r) => {
            let concern: string;
            let suggestion: string;

            if (r.grade === "F") {
              concern = `Low confidence (${Math.round(r.confidence * 100)}%) \u2014 the AI classified this as "${r.decision}" but is essentially guessing.`;
              suggestion =
                r.confidence < 0.5
                  ? "Consider adding a human review trigger or adding more specific classification categories for ambiguous inputs."
                  : "This input may contain sarcasm or mixed signals. Consider rewording the AI instruction to handle ambiguous tone.";
            } else {
              concern = `Moderate-low confidence (${Math.round(r.confidence * 100)}%) \u2014 classified as "${r.decision}" but notable uncertainty.`;
              suggestion =
                "Review whether this classification is correct. If it's a common pattern, consider adding explicit handling in the workflow.";
            }

            return {
              inputId: r.inputId,
              concern,
              suggestion,
            };
          });

          setEdgeCases(heuristicEdgeCases);
        }
      }

      setIsRunning(false);
    },
    [workflow, settings, aiExecutor]
  );

  return {
    isRunning,
    results,
    edgeCases,
    progress,
    runScenario,
  };
}
