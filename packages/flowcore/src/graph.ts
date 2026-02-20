import type { Workflow, WorkflowNode, WorkflowEdge, EdgeCondition } from "./types.js";

/**
 * Finds the single trigger (entry) node in a workflow.
 * A workflow must have exactly one trigger node.
 */
export function findTriggerNode(workflow: Workflow): WorkflowNode {
  const triggers = workflow.nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) {
    throw new Error("Workflow has no trigger node");
  }
  if (triggers.length > 1) {
    throw new Error("Workflow has multiple trigger nodes — only one is allowed");
  }
  return triggers[0];
}

/**
 * Returns a node by ID, or throws if not found.
 */
export function getNode(workflow: Workflow, nodeId: string): WorkflowNode {
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  return node;
}

/**
 * Returns all outgoing edges from a given node.
 */
export function getOutgoingEdges(
  workflow: Workflow,
  nodeId: string
): WorkflowEdge[] {
  return workflow.edges.filter((e) => e.source === nodeId);
}

/**
 * Evaluates an edge condition against an AI node's output.
 * Returns true if the condition matches.
 */
export function evaluateCondition(
  condition: EdgeCondition,
  output: Record<string, unknown>
): boolean {
  const fieldValue = output[condition.field];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;

    case "contains":
      return (
        typeof fieldValue === "string" &&
        typeof condition.value === "string" &&
        fieldValue.includes(condition.value)
      );

    case "greater_than":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue > condition.value
      );

    case "less_than":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue < condition.value
      );

    default:
      return false;
  }
}

/**
 * Finds the best matching edge from a set of outgoing edges
 * based on the AI node's output. For conditional edges, evaluates
 * each condition. If no condition matches, falls back to the first
 * unconditional edge (if any), or the first edge as a last resort.
 *
 * The AI always picks a path — it never refuses to proceed.
 */
export function findBestMatchingEdge(
  edges: WorkflowEdge[],
  output: Record<string, unknown>
): WorkflowEdge {
  // First, try conditional edges
  for (const edge of edges) {
    if (edge.condition && evaluateCondition(edge.condition, output)) {
      return edge;
    }
  }

  // Fall back to unconditional edge
  const unconditional = edges.find((e) => !e.condition);
  if (unconditional) {
    return unconditional;
  }

  // Last resort: first edge (AI always proceeds)
  return edges[0];
}
