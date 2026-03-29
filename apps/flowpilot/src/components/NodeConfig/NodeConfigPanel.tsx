import type { Node } from "@xyflow/react";
import type { FlowNodeData } from "../../nodes/nodeTypes";

interface Props {
  node: Node | undefined;
  onUpdate: (nodeId: string, data: Partial<FlowNodeData>) => void;
}

export default function NodeConfigPanel({ node, onUpdate }: Props) {
  if (!node) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Select a node to configure it
      </div>
    );
  }

  const data = node.data as unknown as FlowNodeData;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Node Configuration
      </h3>

      {/* Label */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Type badge */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
        <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
          {data.type} / {data.subtype}
        </span>
      </div>

      {/* AI node fields */}
      {data.type === "ai" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {data.subtype === "custom" ? "Custom Prompt" : "AI Instruction"}
            </label>
            <textarea
              value={data.instruction ?? ""}
              onChange={(e) => onUpdate(node.id, { instruction: e.target.value })}
              rows={data.subtype === "custom" ? 6 : 4}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder={
                data.subtype === "custom"
                  ? "Write your custom prompt here. Use {input} to reference the input data..."
                  : data.subtype === "extractor"
                    ? "Describe what data to extract from the input..."
                    : "Describe what this AI node should do..."
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {data.subtype === "extractor" ? "Fields to Extract" : "Output Categories"}
            </label>
            <input
              type="text"
              value={(data.outputSchema ?? []).join(", ")}
              onChange={(e) =>
                onUpdate(node.id, {
                  outputSchema: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                data.subtype === "extractor"
                  ? "name, email, topic, urgency"
                  : "positive, negative, neutral"
              }
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              {data.subtype === "extractor"
                ? "Comma-separated field names to extract"
                : "Comma-separated list"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Trace Depth
            </label>
            <select
              value={data.traceDepth ?? "full"}
              onChange={(e) => onUpdate(node.id, { traceDepth: e.target.value as any })}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full">Full</option>
              <option value="summary">Summary</option>
              <option value="off">Off</option>
            </select>
          </div>
        </>
      )}

      {/* Webhook trigger fields */}
      {data.type === "trigger" && data.subtype === "webhook" && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Webhook Endpoint
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">POST</span>
            <input
              type="text"
              value={String(data.actionConfig?.endpoint ?? "/api/webhook")}
              onChange={(e) =>
                onUpdate(node.id, {
                  actionConfig: { ...data.actionConfig, endpoint: e.target.value },
                })
              }
              className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/api/webhook/my-flow"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Accepts JSON POST body as workflow input
          </p>
        </div>
      )}

      {/* Action node fields */}
      {data.type === "action" && data.actionConfig && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Action Details
          </label>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            {JSON.stringify(data.actionConfig, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
