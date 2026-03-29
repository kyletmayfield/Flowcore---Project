import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { FlowNodeData } from "./nodeTypes";

const gradeColors: Record<string, string> = {
  A: "border-green-400 bg-green-50",
  B: "border-blue-400 bg-blue-50",
  C: "border-yellow-400 bg-yellow-50",
  D: "border-orange-400 bg-orange-50",
  F: "border-red-400 bg-red-50",
};

export default function AIExtractorNode({ data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  const gradeStyle = d.grade ? gradeColors[d.grade] ?? "" : "";
  const borderClass = d.grade ? gradeStyle : "border-rose-400";

  return (
    <div className={`bg-white border-2 ${borderClass} rounded-lg shadow-sm px-4 py-3 min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-3 !h-3" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-rose-500 text-xs font-semibold">AI EXTRACTOR</span>
        {d.grade && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white shadow-sm">
            {d.grade} {d.confidence !== undefined ? `${Math.round(d.confidence * 100)}%` : ""}
          </span>
        )}
      </div>
      <div className="text-sm font-medium text-gray-800">{d.label}</div>
      {d.outputSchema && d.outputSchema.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {d.outputSchema.map((field) => (
            <span key={field} className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
              {field}
            </span>
          ))}
        </div>
      )}
      {d.isRunning && (
        <div className="text-xs text-rose-400 mt-1 animate-pulse">Extracting...</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-rose-400 !w-3 !h-3" />
    </div>
  );
}
