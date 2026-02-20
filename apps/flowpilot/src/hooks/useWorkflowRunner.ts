import { useCallback } from "react";
import {
  executeWorkflow,
  type AIExecutor,
  type HumanReviewHandler,
  type Workflow,
  type WorkflowNode,
  type WorkflowSettings,
  type ReasoningTrace,
  buildAINodePrompt,
  parseAIResponse,
} from "@flowcore/engine";
import type { Node } from "@xyflow/react";
import type { FlowNodeData } from "../nodes/nodeTypes";
import type { HumanReviewState } from "./useWorkflowStore";

interface RunnerDeps {
  workflow: Workflow;
  settings: WorkflowSettings;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setIsRunning: (running: boolean) => void;
  setExecutionRun: (run: any) => void;
  setHumanReviewPending: (review: HumanReviewState | null) => void;
}

/**
 * Mock AI executor that simulates Claude API responses.
 * In production, this calls the real Anthropic API.
 * For the demo, it returns realistic mock responses based on input.
 */
export function createMockAIExecutor(): AIExecutor {
  return async (node: WorkflowNode, payload: Record<string, unknown>) => {
    const start = Date.now();

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));

    const message = String(
      payload.message ?? payload.text ?? JSON.stringify(payload)
    ).toLowerCase();
    const categories = node.config.output_schema ?? [];

    let decision: string;
    let confidence: number;
    let reasoning: ReasoningTrace;

    // Smart mock classification based on input content
    if (message.includes("furious") || message.includes("angry") || message.includes("unacceptable")) {
      decision = categories.includes("billing_angry") ? "billing_angry" : categories[0] ?? "negative";
      confidence = 0.91;
      reasoning = {
        summary: "The message contains explicit frustration language and a request for escalation.",
        factors: [
          { factor: "Language tone", observation: `Words like 'furious' or 'unacceptable' indicate strong negative sentiment.`, weight: "high" },
          { factor: "Action request", observation: "Customer requests manager involvement.", weight: "medium" },
          { factor: "Topic detection", observation: "Billing-related keywords detected in the message.", weight: "medium" },
        ],
        alternatives_considered: [
          { option: "technical_issue", why_rejected: "No technical symptoms described; frustration is about billing." },
        ],
      };
    } else if (message.includes("billing") || message.includes("charge") || message.includes("invoice") || message.includes("payment")) {
      decision = categories.includes("billing_general") ? "billing_general" : categories[0] ?? "neutral";
      confidence = 0.85;
      reasoning = {
        summary: "The message contains billing-related keywords in a calm, inquiry tone.",
        factors: [
          { factor: "Topic keywords", observation: "Words like 'billing', 'charge', or 'payment' indicate a financial topic.", weight: "high" },
          { factor: "Emotional tone", observation: "No aggressive language detected; this appears to be a straightforward question.", weight: "medium" },
        ],
        alternatives_considered: [
          { option: "billing_angry", why_rejected: "No frustration markers detected in the message." },
        ],
      };
    } else if (message.includes("error") || message.includes("broken") || message.includes("bug") || message.includes("crash") || message.includes("not working")) {
      decision = categories.includes("technical_issue") ? "technical_issue" : categories[0] ?? "negative";
      confidence = 0.88;
      reasoning = {
        summary: "The message describes a technical problem with the product.",
        factors: [
          { factor: "Technical keywords", observation: "Words like 'error', 'broken', or 'crash' indicate a technical issue.", weight: "high" },
          { factor: "Problem description", observation: "Customer describes specific product functionality not working.", weight: "medium" },
        ],
        alternatives_considered: [
          { option: "billing_general", why_rejected: "No billing or financial terms present." },
        ],
      };
    } else if (message.includes("feature") || message.includes("add") || message.includes("would be great") || message.includes("wish")) {
      decision = categories.includes("feature_request") ? "feature_request" : categories[0] ?? "neutral";
      confidence = 0.82;
      reasoning = {
        summary: "The message suggests a product improvement or new feature.",
        factors: [
          { factor: "Request language", observation: "Phrases like 'would be great' or 'wish' indicate a feature request.", weight: "high" },
          { factor: "Constructive tone", observation: "The message is forward-looking rather than complaint-driven.", weight: "medium" },
        ],
        alternatives_considered: [
          { option: "general_question", why_rejected: "The user is requesting, not asking." },
        ],
      };
    } else if (message.includes("🙄") || message.includes("lol") || message.includes("whatever")) {
      // Ambiguous / sarcastic — low confidence
      decision = categories.includes("general_question") ? "general_question" : categories[0] ?? "neutral";
      confidence = 0.43;
      reasoning = {
        summary: "The message is ambiguous and potentially sarcastic. Classification confidence is very low.",
        factors: [
          { factor: "Sarcasm indicators", observation: "Eye-roll emoji and dismissive language suggest possible sarcasm.", weight: "high" },
          { factor: "Lack of clear topic", observation: "No specific product, billing, or technical terms present.", weight: "medium" },
          { factor: "Short message length", observation: "Very brief messages provide insufficient context for confident classification.", weight: "low" },
        ],
        alternatives_considered: [
          { option: "negative", why_rejected: "Could be negative, but the message is too ambiguous to classify with confidence." },
        ],
      };
    } else {
      decision = categories.includes("general_question") ? "general_question" : categories[0] ?? "neutral";
      confidence = 0.74;
      reasoning = {
        summary: "The message appears to be a general inquiry without strong topic markers.",
        factors: [
          { factor: "Topic analysis", observation: "No specific billing, technical, or feature-related keywords detected.", weight: "medium" },
          { factor: "Tone assessment", observation: "The message has a neutral, question-like tone.", weight: "medium" },
        ],
        alternatives_considered: [
          { option: "feature_request", why_rejected: "No clear request or suggestion language present." },
        ],
      };
    }

    return {
      output: { decision },
      reasoning,
      confidence,
      duration_ms: Date.now() - start,
    };
  };
}

export function useWorkflowRunner(deps: RunnerDeps) {
  const {
    workflow,
    settings,
    nodes,
    setNodes,
    setIsRunning,
    setExecutionRun,
    setHumanReviewPending,
  } = deps;

  const run = useCallback(
    async (input: Record<string, unknown>) => {
      setIsRunning(true);
      setExecutionRun(null);

      // Update nodes to show running state
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          data: { ...n.data, isRunning: false, grade: undefined, confidence: undefined },
        }))
      );

      const aiExecutor = createMockAIExecutor();

      // Wrap AI executor to update node visuals during execution
      const visualAIExecutor: AIExecutor = async (node, payload) => {
        // Mark this node as running
        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, isRunning: true } } : n
          )
        );

        const result = await aiExecutor(node, payload);

        // Mark node as done with grade
        const grade =
          result.confidence !== undefined
            ? result.confidence >= 0.9
              ? "A"
              : result.confidence >= 0.8
                ? "B"
                : result.confidence >= 0.7
                  ? "C"
                  : result.confidence >= 0.6
                    ? "D"
                    : "F"
            : undefined;

        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id
              ? { ...n, data: { ...n.data, isRunning: false, grade, confidence: result.confidence } }
              : n
          )
        );

        return result;
      };

      // Human review handler
      const humanReviewHandler: HumanReviewHandler = async (
        node,
        aiDecision,
        aiGrade,
        availableOptions,
        timeoutSeconds
      ) => {
        return new Promise<string | null>((resolve) => {
          setHumanReviewPending({
            nodeId: node.id,
            aiDecision,
            aiConfidence: 0,
            aiGrade,
            reasoning: null,
            availableOptions,
            timeoutSeconds,
            resolve: (option) => {
              setHumanReviewPending(null);
              resolve(option);
            },
          });
        });
      };

      try {
        const workflowWithSettings = {
          ...workflow,
          settings,
        };

        const result = await executeWorkflow({
          workflow: workflowWithSettings,
          input,
          aiExecutor: visualAIExecutor,
          humanReviewHandler,
        });

        setExecutionRun(result);
      } catch (err) {
        console.error("Workflow execution failed:", err);
      } finally {
        setIsRunning(false);
      }
    },
    [workflow, settings, setNodes, setIsRunning, setExecutionRun, setHumanReviewPending]
  );

  return { run };
}
