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
              AI Instruction
            </label>
            <textarea
              value={data.instruction ?? ""}
              onChange={(e) => onUpdate(node.id, { instruction: e.target.value })}
              rows={4}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Describe what this AI node should do..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Output Categories
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
              placeholder="positive, negative, neutral"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">Comma-separated list</p>
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
