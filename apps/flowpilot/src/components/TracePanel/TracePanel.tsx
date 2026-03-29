import { useState } from "react";
import type { ExecutionRun, NodeTrace, ReasoningTrace, Grade } from "@flowcore/engine";

interface Props {
  executionRun: ExecutionRun | null;
  workflowNodes: { id: string; data: { label: string; type: string } }[];
}

const gradeColors: Record<string, string> = {
  A: "text-green-600 bg-green-50",
  B: "text-blue-600 bg-blue-50",
  C: "text-yellow-600 bg-yellow-50",
  D: "text-orange-600 bg-orange-50",
  F: "text-red-600 bg-red-50",
};

const gradeDots: Record<string, string> = {
  A: "bg-green-400",
  B: "bg-blue-400",
  C: "bg-yellow-400",
  D: "bg-orange-400",
  F: "bg-red-400",
};

export default function TracePanel({ executionRun, workflowNodes }: Props) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  if (!executionRun) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Run the workflow to see the execution trace
      </div>
    );
  }

  const getNodeLabel = (nodeId: string) => {
    const node = workflowNodes.find((n) => n.id === nodeId);
    return node?.data.label ?? nodeId;
  };

  const getNodeType = (nodeId: string) => {
    const node = workflowNodes.find((n) => n.id === nodeId);
    return node?.data.type ?? "unknown";
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Execution Trace
        </h3>
        <span className={`text-sm font-bold px-2 py-0.5 rounded ${gradeColors[executionRun.trust_grade]}`}>
          Run Grade: {executionRun.trust_grade} ({executionRun.trust_score}%)
        </span>
      </div>

      {executionRun.node_traces.map((trace, i) => (
        <TraceStep
          key={trace.node_id}
          trace={trace}
          stepNumber={i + 1}
          label={getNodeLabel(trace.node_id)}
          nodeType={getNodeType(trace.node_id)}
          isExpanded={expandedNodeId === trace.node_id}
          onToggle={() =>
            setExpandedNodeId(expandedNodeId === trace.node_id ? null : trace.node_id)
          }
        />
      ))}

      {executionRun.status === "human_override" && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
          Human override was applied during this run.
        </div>
      )}
    </div>
  );
}

function TraceStep({
  trace,
  stepNumber,
  label,
  nodeType,
  isExpanded,
  onToggle,
}: {
  trace: NodeTrace;
  stepNumber: number;
  label: string;
  nodeType: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasReasoning = trace.reasoning && trace.reasoning.summary;
  const isAI = trace.confidence !== undefined;

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs text-gray-400 w-6">#{stepNumber}</span>
        <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
        {isAI && trace.grade && (
          <>
            <span className={`w-2 h-2 rounded-full ${gradeDots[trace.grade]}`} />
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColors[trace.grade]}`}>
              {trace.grade} {Math.round((trace.confidence ?? 0) * 100)}%
            </span>
          </>
        )}
        {!isAI && <span className="text-xs text-green-500">OK</span>}
        {trace.human_override && (
          <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
            OVERRIDE
          </span>
        )}
        <span className="text-xs text-gray-400">{trace.duration_ms}ms</span>
        {hasReasoning && (
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isExpanded && hasReasoning && trace.reasoning && (
        <ReasoningDetail reasoning={trace.reasoning} output={trace.output} />
      )}
    </div>
  );
}

function ReasoningDetail({
  reasoning,
  output,
}: {
  reasoning: ReasoningTrace;
  output: Record<string, unknown>;
}) {
  return (
    <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50 space-y-2">
      {/* Decision */}
      <div className="pt-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase">Decision</span>
        <div className="text-sm text-gray-700 font-mono">
          {JSON.stringify(output.decision ?? output)}
        </div>
      </div>

      {/* Summary */}
      <div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase">Summary</span>
        <p className="text-sm text-gray-700">{reasoning.summary}</p>
      </div>

      {/* Factors */}
      {reasoning.factors && reasoning.factors.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Factors</span>
          <div className="space-y-1 mt-0.5">
            {reasoning.factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-0.5 px-1 py-0.5 rounded text-[10px] font-medium ${
                    f.weight === "high"
                      ? "bg-red-100 text-red-700"
                      : f.weight === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {f.weight}
                </span>
                <div>
                  <span className="font-medium text-gray-700">{f.factor}:</span>{" "}
                  <span className="text-gray-600">{f.observation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {reasoning.alternatives_considered && reasoning.alternatives_considered.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase">
            Alternatives Considered
          </span>
          <div className="space-y-1 mt-0.5">
            {reasoning.alternatives_considered.map((a, i) => (
              <div key={i} className="text-xs text-gray-600">
                <span className="font-medium">{a.option}</span> — {a.why_rejected}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
