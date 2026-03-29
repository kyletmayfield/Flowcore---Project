import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "./nodeTypes";

export default function WebhookTriggerNode({ data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  return (
    <div className="bg-white border-2 border-emerald-400 rounded-lg shadow-sm px-4 py-3 min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-emerald-500 text-xs font-semibold">WEBHOOK TRIGGER</span>
      </div>
      <div className="text-sm font-medium text-gray-800">{d.label}</div>
      {d.actionConfig?.endpoint ? (
        <div className="text-[10px] text-gray-400 font-mono mt-1 truncate">
          POST {String(d.actionConfig.endpoint)}
        </div>
      ) : null}
      {d.isRunning && (
        <div className="text-xs text-emerald-400 mt-1 animate-pulse">Receiving...</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-3 !h-3" />
    </div>
  );
}
