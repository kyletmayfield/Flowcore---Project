import type { Persona, Platform } from "@flowcore/engine";

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

interface Props {
  persona: Persona;
}

export default function LearningStatus({ persona }: Props) {
  const platforms: Platform[] = ["instagram", "twitter", "linkedin", "facebook"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Persona Learning Status
      </h3>
      <div className="space-y-2">
        {platforms.map((p) => {
          const hist = persona.learned_preferences[p];
          if (!hist) {
            return (
              <div key={p} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{PLATFORM_LABELS[p]}</span>
                <span className="text-gray-300">No data yet</span>
              </div>
            );
          }
          return (
            <div key={p} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-600">{PLATFORM_LABELS[p]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{hist.generation_count} gens</span>
                  {hist.adaptive_ai_active && (
                    <span className="text-[10px] bg-amber-100 text-amber-600 px-1 py-0.5 rounded">
                      AI Active
                    </span>
                  )}
                </div>
              </div>
              {hist.common_edits.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {hist.common_edits.map((edit) => (
                    <span key={edit} className="text-[10px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded">
                      {edit.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
