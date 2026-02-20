import { useState, useCallback } from "react";
import { executeWorkflow, type Workflow, type WorkflowSettings, type ExecutionRun } from "@flowcore/engine";
import type { AIExecutor } from "@flowcore/engine";
import type { ScenarioInput } from "../components/ScenarioTest/ScenarioTestPanel";
import type { ScenarioResultData, EdgeCase } from "../components/ScenarioTest/ScenarioResults";

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
          const decision = (aiTrace?.output as any)?.decision ?? "—";

          allResults.push({
            inputId: input.id,
            inputPreview: String(
              (input.data as any).message ?? JSON.stringify(input.data)
            ).slice(0, 80),
            decision,
            pathTaken: run.node_traces
              .filter((t) => t.edge_taken)
              .map((t) => t.edge_taken)
              .join(" → "),
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

      const generatedEdgeCases: EdgeCase[] = lowConfidence.map((r) => {
        let concern: string;
        let suggestion: string;

        if (r.grade === "F") {
          concern = `Low confidence (${Math.round(r.confidence * 100)}%) — the AI classified this as "${r.decision}" but is essentially guessing.`;
          suggestion =
            r.confidence < 0.5
              ? "Consider adding a human review trigger or adding more specific classification categories for ambiguous inputs."
              : "This input may contain sarcasm or mixed signals. Consider rewording the AI instruction to handle ambiguous tone.";
        } else {
          concern = `Moderate-low confidence (${Math.round(r.confidence * 100)}%) — classified as "${r.decision}" but notable uncertainty.`;
          suggestion =
            "Review whether this classification is correct. If it's a common pattern, consider adding explicit handling in the workflow.";
        }

        return {
          inputId: r.inputId,
          concern,
          suggestion,
        };
      });

      setEdgeCases(generatedEdgeCases);
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
