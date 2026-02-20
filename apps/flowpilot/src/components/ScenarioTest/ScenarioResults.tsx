import { useState } from "react";
import type { ExecutionRun } from "@flowcore/engine";

interface ScenarioResultData {
  inputId: string;
  inputPreview: string;
  decision: string;
  pathTaken: string;
  confidence: number;
  grade: string;
  status: string;
  run: ExecutionRun;
}

interface EdgeCase {
  inputId: string;
  concern: string;
  suggestion: string;
}

interface Props {
  results: ScenarioResultData[];
  edgeCases: EdgeCase[];
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

export default function ScenarioResults({ results, edgeCases }: Props) {
  const [showEdgeCases, setShowEdgeCases] = useState(false);

  if (results.length === 0) return null;

  // Grade distribution
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  results.forEach((r) => distribution[r.grade]++);

  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.confidence * 100, 0) / results.length
  );
  const avgGrade =
    avgScore >= 90 ? "A" : avgScore >= 80 ? "B" : avgScore >= 70 ? "C" : avgScore >= 60 ? "D" : "F";

  return (
    <div className="p-4 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4">
        <div className={`text-2xl font-bold ${gradeColors[avgGrade].split(" ")[0]}`}>
          {avgGrade}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">
            Workflow Trust Grade: {avgGrade} ({avgScore}/100)
          </div>
          <div className="text-xs text-gray-500">
            {results.length} inputs tested &middot; {edgeCases.length} edge case{edgeCases.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Grade distribution chips */}
        <div className="flex gap-1">
          {Object.entries(distribution).map(([grade, count]) =>
            count > 0 ? (
              <span
                key={grade}
                className={`text-xs font-bold px-2 py-0.5 rounded ${gradeColors[grade]}`}
              >
                {grade}: {count}
              </span>
            ) : null
          )}
        </div>

        {edgeCases.length > 0 && (
          <button
            onClick={() => setShowEdgeCases((p) => !p)}
            className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100"
          >
            {showEdgeCases ? "Hide" : "View"} Edge Cases
          </button>
        )}
      </div>

      {/* Results matrix */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {results.map((r, i) => (
          <div key={r.inputId} className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
            <span className="flex-1 text-gray-600 font-mono truncate max-w-[250px]">
              {r.inputPreview}
            </span>
            <span className="text-gray-500 font-mono w-28 truncate">
              {r.decision}
            </span>
            <span className={`w-2 h-2 rounded-full ${gradeDots[r.grade]}`} />
            <span className={`font-bold px-1.5 py-0.5 rounded min-w-[52px] text-center ${gradeColors[r.grade]}`}>
              {r.grade} {Math.round(r.confidence * 100)}%
            </span>
            {r.status === "human_override" && (
              <span className="text-[10px] text-amber-600">OVERRIDE</span>
            )}
          </div>
        ))}
      </div>

      {/* Edge cases report */}
      {showEdgeCases && edgeCases.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-md p-3 space-y-2">
          <h4 className="text-xs font-semibold text-amber-700 uppercase">Edge Case Report</h4>
          {edgeCases.map((ec, i) => (
            <div key={i} className="text-xs space-y-0.5">
              <div className="text-gray-700">
                <span className="font-medium">Input {ec.inputId}:</span> {ec.concern}
              </div>
              <div className="text-amber-700">
                Suggestion: {ec.suggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ScenarioResultData, EdgeCase };
