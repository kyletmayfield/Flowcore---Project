import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "./nodeTypes";

export default function LoggerNode({ data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  return (
    <div className="bg-white border-2 border-gray-400 rounded-lg shadow-sm px-4 py-3 min-w-[160px]">
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-500 text-xs font-semibold">LOGGER</span>
      </div>
      <div className="text-sm font-medium text-gray-800">{d.label}</div>
      {d.isRunning && (
        <div className="text-xs text-gray-400 mt-1 animate-pulse">Logging...</div>
      )}
    </div>
  );
}
