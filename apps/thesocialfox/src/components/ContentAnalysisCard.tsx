import type { ContentAnalysis } from "socialfox-adapter";

interface Props {
  analysis: ContentAnalysis;
}

export default function ContentAnalysisCard({ analysis }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Content Analysis
      </h3>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
          {analysis.type.replace(/_/g, " ")}
        </span>
        <span className="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full font-medium">
          {analysis.mood}
        </span>
      </div>
      {analysis.key_elements.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {analysis.key_elements.map((el, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {el}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
