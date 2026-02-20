import ManualTriggerNode from "./ManualTriggerNode";
import AIClassifierNode from "./AIClassifierNode";
import AISentimentNode from "./AISentimentNode";
import NotificationNode from "./NotificationNode";
import LoggerNode from "./LoggerNode";

export const nodeTypes = {
  manualTrigger: ManualTriggerNode,
  aiClassifier: AIClassifierNode,
  aiSentiment: AISentimentNode,
  notification: NotificationNode,
  logger: LoggerNode,
};

export type FlowNodeType = keyof typeof nodeTypes;

export interface FlowNodeData {
  label: string;
  type: "trigger" | "ai" | "action";
  subtype: string;
  instruction?: string;
  outputSchema?: string[];
  traceDepth?: "full" | "summary" | "off";
  actionType?: string;
  actionConfig?: Record<string, unknown>;
  // Runtime state
  grade?: string;
  confidence?: number;
  isRunning?: boolean;
}
