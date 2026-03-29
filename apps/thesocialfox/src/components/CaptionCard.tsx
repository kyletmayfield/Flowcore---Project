import { useState } from "react";
import type { Platform, ReasoningTrace } from "@flowcore/engine";
import type { CaptionResult } from "socialfox-adapter";

const GRADE_COLORS: Record<string, string> = {
  A: "bg-grade-A",
  B: "bg-grade-B",
  C: "bg-grade-C",
  D: "bg-grade-D",
  F: "bg-grade-F",
};

const GRADE_TEXT: Record<string, string> = {
  A: "text-grade-A",
  B: "text-grade-B",
  C: "text-grade-C",
  D: "text-grade-D",
  F: "text-grade-F",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

interface Props {
  platform: Platform;
  result: CaptionResult;
  editedCaption: string;
  isSelected: boolean;
  advancedView: boolean;
  onSelect: () => void;
  onEdit: (value: string) => void;
}

export default function CaptionCard({
  platform,
  result,
  editedCaption,
  isSelected,
  advancedView,
  onSelect,
  onEdit,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const hasEdits = editedCaption !== result.caption;

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all ${
        isSelected ? "border-fox-400 shadow-md" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {PLATFORM_LABELS[platform]}
          </span>
          {result.adaptiveAIUsed && (
            <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
              AI-Assisted
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${GRADE_COLORS[result.grade]}`}
          >
            {result.grade}
          </span>
          <span className={`text-xs font-semibold ${GRADE_TEXT[result.grade]}`}>
            {Math.round(result.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Caption body */}
      <div className="px-4 py-3">
        {isEditing ? (
          <textarea
            value={editedCaption}
            onChange={(e) => onEdit(e.target.value)}
            rows={5}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fox-400 resize-y"
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-700 whitespace-pre-wrap cursor-text hover:bg-gray-50 rounded p-1 -m-1 transition-colors min-h-[60px]"
          >
            {editedCaption}
          </div>
        )}
        {hasEdits && (
          <p className="text-[10px] text-fox-500 mt-1">Edited from original</p>
        )}
      </div>

      {/* Advanced view: reasoning trace */}
      {advancedView && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showReasoning ? "Hide Reasoning" : "View Reasoning"}
          </button>
          {showReasoning && (
            <ReasoningPanel reasoning={result.reasoning} />
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-b-xl">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onSelect}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
            isSelected
              ? "bg-fox-500 text-white"
              : "bg-gray-200 text-gray-500 hover:bg-fox-100 hover:text-fox-600"
          }`}
        >
          {isSelected ? "Selected" : "Select Favorite"}
        </button>
      </div>
    </div>
  );
}

function ReasoningPanel({ reasoning }: { reasoning: ReasoningTrace }) {
  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
      <p className="text-gray-600 font-medium">{reasoning.summary}</p>
      {reasoning.factors.length > 0 && (
        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Factors</p>
          {reasoning.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                  f.weight === "high" ? "bg-red-400" : f.weight === "medium" ? "bg-yellow-400" : "bg-gray-300"
                }`}
              />
              <div>
                <span className="font-medium text-gray-600">{f.factor}:</span>{" "}
                <span className="text-gray-500">{f.observation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {reasoning.alternatives_considered.length > 0 && (
        <div className="space-y-1">
          <p className="text-gray-400 font-semibold uppercase text-[10px]">Alternatives Considered</p>
          {reasoning.alternatives_considered.map((alt, i) => (
            <div key={i} className="text-gray-500">
              <span className="font-medium">{alt.option}:</span> {alt.why_rejected}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
