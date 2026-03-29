import type { Platform } from "@flowcore/engine";
import { useSocialFoxStore } from "./hooks/useSocialFoxStore";
import PersonaBadge from "./components/PersonaBadge";
import PlatformSelector from "./components/PlatformSelector";
import InputPanel from "./components/InputPanel";
import CaptionCard from "./components/CaptionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ContentAnalysisCard from "./components/ContentAnalysisCard";
import LearningStatus from "./components/LearningStatus";

export default function App() {
  const store = useSocialFoxStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fox-500 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">TheSocialFox</h1>
              <p className="text-[10px] text-gray-400">Powered by FlowCore Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs text-gray-400">Advanced</span>
              <button
                onClick={() => store.setAdvancedView(!store.advancedView)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  store.advancedView ? "bg-fox-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    store.advancedView ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </label>
            <select
              value={store.traceDepth}
              onChange={(e) => store.setTraceDepth(e.target.value as "full" | "summary" | "off")}
              className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500"
            >
              <option value="full">Trace: Full</option>
              <option value="summary">Trace: Summary</option>
              <option value="off">Trace: Off</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar — input controls */}
          <div className="col-span-4 space-y-4">
            <PersonaBadge persona={store.persona} />
            <PlatformSelector
              selectedPlatforms={store.selectedPlatforms}
              onToggle={store.togglePlatform}
              preGenConfidence={store.generationRun?.preGenConfidence}
            />
            <InputPanel
              userContext={store.userContext}
              hasImage={store.hasImage}
              isGenerating={store.isGenerating}
              canGenerate={store.userContext.trim().length > 0 && store.selectedPlatforms.length > 0}
              onContextChange={store.setUserContext}
              onImageToggle={store.setHasImage}
              onGenerate={store.generate}
            />
          </div>

          {/* Right area — results */}
          <div className="col-span-8 space-y-4">
            {store.isGenerating && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-fox-200 border-t-fox-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Generating captions across {store.selectedPlatforms.length} platforms...</p>
                  <p className="text-xs text-gray-400 mt-1">Analyzing content, checking confidence, generating...</p>
                </div>
              </div>
            )}

            {!store.isGenerating && !store.generationRun && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-fox-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-fox-500 text-xl">F</span>
                  </div>
                  <p className="text-sm text-gray-500">Enter your content context and select platforms</p>
                  <p className="text-xs text-gray-400 mt-1">TheSocialFox will generate platform-optimized captions using your persona</p>
                </div>
              </div>
            )}

            {!store.isGenerating && store.generationRun && (
              <>
                {/* Pre-gen confidence + content analysis (advanced view) */}
                {store.advancedView && (
                  <div className="grid grid-cols-2 gap-4">
                    <ConfidenceBar
                      preGenConfidence={store.generationRun.preGenConfidence}
                      platforms={store.selectedPlatforms}
                    />
                    <ContentAnalysisCard analysis={store.generationRun.contentAnalysis} />
                  </div>
                )}

                {/* Caption cards — side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {store.selectedPlatforms.map((platform) => {
                    const result = store.generationRun!.results[platform];
                    if (!result) return null;
                    return (
                      <CaptionCard
                        key={platform}
                        platform={platform}
                        result={result}
                        editedCaption={store.edits[platform] ?? result.caption}
                        isSelected={store.selections[platform] ?? false}
                        advancedView={store.advancedView}
                        onSelect={() => store.selectCaption(platform)}
                        onEdit={(val) => store.updateEdit(platform, val)}
                      />
                    );
                  })}
                </div>

                {/* Learning status (advanced view) */}
                {store.advancedView && (
                  <LearningStatus persona={store.persona} />
                )}

                {/* Selection summary */}
                {Object.values(store.selections).some(Boolean) && (
                  <div className="bg-fox-50 border border-fox-200 rounded-lg p-3 text-sm text-fox-700">
                    <span className="font-semibold">
                      {Object.values(store.selections).filter(Boolean).length} caption(s) selected
                    </span>
                    {" — "}
                    Your persona is learning from your selections to improve future generations.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
