import type {
  Workflow,
  WorkflowNode,
  WorkflowSettings,
  ExecutionRun,
  NodeTrace,
  Grade,
} from "./types.js";
import { findTriggerNode, getNode, getOutgoingEdges, findBestMatchingEdge } from "./graph.js";
import { calculateGrade, calculateWorkflowGrade } from "./grading.js";
import { shouldTriggerHumanReview } from "./human-review.js";

/**
 * Callback for AI node execution.
 * The consumer (FlowPilot, SocialFox) provides this to handle
 * the actual Claude API call.
 */
export type AIExecutor = (
  node: WorkflowNode,
  payload: Record<string, unknown>
) => Promise<{
  output: Record<string, unknown>;
  reasoning?: import("./types.js").ReasoningTrace;
  confidence?: number;
  duration_ms: number;
}>;

/**
 * Callback for human review.
 * Returns the user's selected option, or null if timed out.
 */
export type HumanReviewHandler = (
  node: WorkflowNode,
  aiDecision: string,
  aiGrade: Grade,
  availableOptions: string[],
  timeoutSeconds: number
) => Promise<string | null>;

export interface ExecuteWorkflowOptions {
  workflow: Workflow;
  input: Record<string, unknown>;
  aiExecutor: AIExecutor;
  humanReviewHandler?: HumanReviewHandler;
  isBatchTesting?: boolean;
}

/**
 * Executes a workflow from trigger to terminal node.
 *
 * Walks the directed graph node by node:
 * - Trigger nodes pass through the input
 * - AI nodes call the provided aiExecutor callback
 * - Action nodes execute their configured action
 * - At branch points, follows the best matching edge
 * - F-graded decisions may pause for human review
 *
 * Returns a complete ExecutionRun with traces at every node.
 */
export async function executeWorkflow(
  options: ExecuteWorkflowOptions
): Promise<ExecutionRun> {
  const {
    workflow,
    input,
    aiExecutor,
    humanReviewHandler,
    isBatchTesting = false,
  } = options;

  const executionId = generateId();
  const startedAt = new Date().toISOString();
  const nodeTraces: NodeTrace[] = [];
  let status: ExecutionRun["status"] = "complete";

  let currentNode: WorkflowNode | null = findTriggerNode(workflow);
  let payload: Record<string, unknown> = { ...input };

  while (currentNode !== null) {
    const traceStart = Date.now();

    if (currentNode.type === "ai") {
      // AI node — delegate to the provided executor
      const result = await aiExecutor(currentNode, payload);

      let grade: Grade | undefined;
      if (result.confidence !== undefined) {
        grade = calculateGrade(result.confidence);
      }

      const trace: NodeTrace = {
        node_id: currentNode.id,
        input: { ...payload },
        output: result.output,
        reasoning: result.reasoning,
        confidence: result.confidence,
        grade,
        duration_ms: result.duration_ms,
      };

      // Determine next node
      const outgoingEdges = getOutgoingEdges(workflow, currentNode.id);

      if (outgoingEdges.length === 0) {
        nodeTraces.push(trace);
        payload = result.output;
        currentNode = null;
      } else if (outgoingEdges.length === 1 && !outgoingEdges[0].condition) {
        trace.edge_taken = outgoingEdges[0].id;
        nodeTraces.push(trace);
        payload = result.output;
        currentNode = getNode(workflow, outgoingEdges[0].target);
      } else {
        // Branching — AI picks best option
        let matchingEdge = findBestMatchingEdge(outgoingEdges, result.output);

        // Check for human-in-the-loop
        if (
          grade === "F" &&
          shouldTriggerHumanReview(grade, workflow.settings, isBatchTesting) &&
          humanReviewHandler
        ) {
          const availableOptions = outgoingEdges
            .filter((e) => e.condition)
            .map((e) => e.condition!.value as string);

          const humanChoice = await humanReviewHandler(
            currentNode,
            (result.output as Record<string, string>).decision ?? "",
            grade,
            availableOptions,
            workflow.settings.review_timeout_seconds
          );

          if (humanChoice !== null) {
            const overrideEdge = outgoingEdges.find(
              (e) => e.condition?.value === humanChoice
            );
            if (overrideEdge) {
              matchingEdge = overrideEdge;
              trace.human_override = true;
              status = "human_override";
            }
          }
        }

        trace.edge_taken = matchingEdge.id;
        nodeTraces.push(trace);
        payload = result.output;
        currentNode = getNode(workflow, matchingEdge.target);
      }
    } else {
      // Trigger or Action node — pass through
      const trace: NodeTrace = {
        node_id: currentNode.id,
        input: { ...payload },
        output: { ...payload },
        duration_ms: Date.now() - traceStart,
      };

      const outgoingEdges = getOutgoingEdges(workflow, currentNode.id);

      if (outgoingEdges.length === 0) {
        nodeTraces.push(trace);
        currentNode = null;
      } else {
        trace.edge_taken = outgoingEdges[0].id;
        nodeTraces.push(trace);
        currentNode = getNode(workflow, outgoingEdges[0].target);
      }
    }
  }

  const { score: trustScore, grade: trustGrade } =
    calculateWorkflowGrade(nodeTraces);

  return {
    id: executionId,
    workflow_id: workflow.id,
    input,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    status,
    trust_score: trustScore,
    trust_grade: trustGrade,
    node_traces: nodeTraces,
  };
}

function generateId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
