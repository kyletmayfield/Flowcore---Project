import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "./nodeTypes";

export default function ManualTriggerNode({ data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  return (
    <div className="bg-white border-2 border-indigo-400 rounded-lg shadow-sm px-4 py-3 min-w-[160px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-indigo-500 text-sm font-semibold">TRIGGER</span>
      </div>
      <div className="text-sm font-medium text-gray-800">{d.label}</div>
      {d.isRunning && (
        <div className="text-xs text-indigo-400 mt-1 animate-pulse">Running...</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-3 !h-3" />
    </div>
  );
}
