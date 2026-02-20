import type { Platform, ConfidenceEstimate } from "@flowcore/engine";

const GRADE_COLORS: Record<string, string> = {
  A: "bg-grade-A",
  B: "bg-grade-B",
  C: "bg-grade-C",
  D: "bg-grade-D",
  F: "bg-grade-F",
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

interface Props {
  preGenConfidence: Record<Platform, ConfidenceEstimate>;
  platforms: Platform[];
}

export default function ConfidenceBar({ preGenConfidence, platforms }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Pre-Generation Confidence
      </h3>
      <div className="space-y-2.5">
        {platforms.map((p) => {
          const est = preGenConfidence[p];
          if (!est) return null;
          const pct = Math.round(est.confidence * 100);
          return (
            <div key={p}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {PLATFORM_LABELS[p]}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${GRADE_COLORS[est.grade]}`}
                  >
                    {est.grade}
                  </span>
                  <span className="text-xs text-gray-500">{pct}%</span>
                  {est.source === "ai_assisted" && (
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${GRADE_COLORS[est.grade]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{est.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
