import type { Platform, ConfidenceEstimate } from "@flowcore/engine";

const PLATFORM_META: Record<Platform, { label: string; icon: string; color: string }> = {
  instagram: { label: "Instagram", icon: "IG", color: "bg-pink-100 text-pink-600 border-pink-200" },
  twitter: { label: "Twitter/X", icon: "X", color: "bg-sky-100 text-sky-600 border-sky-200" },
  linkedin: { label: "LinkedIn", icon: "in", color: "bg-blue-100 text-blue-600 border-blue-200" },
  facebook: { label: "Facebook", icon: "fb", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "text-grade-A",
  B: "text-grade-B",
  C: "text-grade-C",
  D: "text-grade-D",
  F: "text-grade-F",
};

interface Props {
  selectedPlatforms: Platform[];
  onToggle: (platform: Platform) => void;
  preGenConfidence?: Record<Platform, ConfidenceEstimate>;
}

export default function PlatformSelector({ selectedPlatforms, onToggle, preGenConfidence }: Props) {
  const platforms: Platform[] = ["instagram", "twitter", "linkedin", "facebook"];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Platforms
      </label>
      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => {
          const meta = PLATFORM_META[p];
          const isSelected = selectedPlatforms.includes(p);
          const confidence = preGenConfidence?.[p];
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                isSelected
                  ? `${meta.color} border-current`
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">{meta.icon}</span>
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
              {confidence && isSelected && (
                <span className={`text-xs font-bold ${GRADE_COLORS[confidence.grade]}`}>
                  {confidence.grade} {Math.round(confidence.confidence * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
