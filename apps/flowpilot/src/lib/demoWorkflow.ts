import type { Workflow } from "@flowcore/engine";

/**
 * Pre-built Support Ticket Triage demo workflow.
 *
 * [Manual Input] → [AI: Classify Category & Sentiment]
 *   ├─ "billing_angry"    → [Notify: Senior Agent + Priority Flag]
 *   ├─ "billing_general"  → [Notify: Billing Team]
 *   ├─ "technical_issue"  → [Notify: Tech Support]
 *   ├─ "feature_request"  → [Log: Product Backlog]
 *   └─ "general_question" → [Notify: FAQ Bot]
 */
export const demoWorkflow: Workflow = {
  id: "wf_demo_triage",
  name: "Support Ticket Triage",
  description:
    "Classifies incoming support tickets by category and sentiment, then routes to the appropriate team.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      subtype: "manual",
      position: { x: 400, y: 0 },
      config: {
        label: "Support Ticket Input",
        trigger_type: "manual",
      },
    },
    {
      id: "ai_classify",
      type: "ai",
      subtype: "classifier",
      position: { x: 400, y: 150 },
      config: {
        label: "Classify Category & Sentiment",
        instruction:
          "Analyze this support ticket and classify it into exactly one category. Consider both the topic and the emotional tone. If the customer is angry about billing, choose billing_angry. If it's a calm billing question, choose billing_general.",
        output_schema: [
          "billing_angry",
          "billing_general",
          "technical_issue",
          "feature_request",
          "general_question",
        ],
        trace_depth: "full",
      },
    },
    {
      id: "notify_senior",
      type: "action",
      subtype: "notification",
      position: { x: 50, y: 350 },
      config: {
        label: "Senior Agent + Priority",
        action_type: "notification",
        action_config: {
          channel: "senior-agents",
          priority: "high",
          template: "URGENT: Angry billing customer requires immediate attention.",
        },
      },
    },
    {
      id: "notify_billing",
      type: "action",
      subtype: "notification",
      position: { x: 225, y: 350 },
      config: {
        label: "Billing Team",
        action_type: "notification",
        action_config: {
          channel: "billing",
          priority: "normal",
          template: "New billing inquiry routed to your queue.",
        },
      },
    },
    {
      id: "notify_tech",
      type: "action",
      subtype: "notification",
      position: { x: 400, y: 350 },
      config: {
        label: "Tech Support",
        action_type: "notification",
        action_config: {
          channel: "tech-support",
          priority: "normal",
          template: "Technical issue reported. See details below.",
        },
      },
    },
    {
      id: "log_feature",
      type: "action",
      subtype: "logger",
      position: { x: 575, y: 350 },
      config: {
        label: "Product Backlog",
        action_type: "logger",
        action_config: { destination: "product-backlog" },
      },
    },
    {
      id: "notify_faq",
      type: "action",
      subtype: "notification",
      position: { x: 750, y: 350 },
      config: {
        label: "FAQ Bot",
        action_type: "notification",
        action_config: {
          channel: "faq-bot",
          priority: "low",
          template: "General question — attempting automated response.",
        },
      },
    },
  ],
  edges: [
    { id: "e_trigger_ai", source: "trigger", target: "ai_classify" },
    {
      id: "e_billing_angry",
      source: "ai_classify",
      target: "notify_senior",
      condition: { field: "decision", operator: "equals", value: "billing_angry" },
    },
    {
      id: "e_billing_general",
      source: "ai_classify",
      target: "notify_billing",
      condition: { field: "decision", operator: "equals", value: "billing_general" },
    },
    {
      id: "e_technical",
      source: "ai_classify",
      target: "notify_tech",
      condition: { field: "decision", operator: "equals", value: "technical_issue" },
    },
    {
      id: "e_feature",
      source: "ai_classify",
      target: "log_feature",
      condition: { field: "decision", operator: "equals", value: "feature_request" },
    },
    {
      id: "e_general",
      source: "ai_classify",
      target: "notify_faq",
      condition: { field: "decision", operator: "equals", value: "general_question" },
    },
  ],
  settings: {
    human_review_mode: "pause_on_fail",
    review_timeout_seconds: 30,
    default_trace_depth: "full",
  },
};

/**
 * Converts the engine Workflow to React Flow nodes/edges format.
 */
export function workflowToReactFlow(workflow: Workflow) {
  const nodeTypeMap: Record<string, string> = {
    "trigger:manual": "manualTrigger",
    "trigger:webhook": "webhookTrigger",
    "ai:classifier": "aiClassifier",
    "ai:sentiment": "aiSentiment",
    "ai:extractor": "aiExtractor",
    "ai:custom": "customAI",
    "action:notification": "notification",
    "action:logger": "logger",
  };

  const nodes = workflow.nodes.map((n) => ({
    id: n.id,
    type: nodeTypeMap[`${n.type}:${n.subtype}`] ?? "default",
    position: n.position,
    data: {
      label: n.config.label,
      type: n.type,
      subtype: n.subtype,
      instruction: n.config.instruction,
      outputSchema: n.config.output_schema,
      traceDepth: n.config.trace_depth,
      actionType: n.config.action_type,
      actionConfig: n.config.action_config,
    },
  }));

  const edges = workflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.condition?.value?.toString() ?? "",
    animated: false,
    style: { strokeWidth: 2 },
    labelStyle: { fontSize: 10, fontWeight: 500 },
    labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.9 },
  }));

  return { nodes, edges };
}
