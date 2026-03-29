interface Props {
  userContext: string;
  hasImage: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  onContextChange: (value: string) => void;
  onImageToggle: (value: boolean) => void;
  onGenerate: () => void;
}

const SAMPLE_INPUTS = [
  "New single-origin Ethiopian pour-over just landed. The aroma is unreal — notes of blueberry and dark chocolate. Shot on our back counter with morning light streaming in.",
  "Behind the scenes at our roastery. Our head roaster Maria has been perfecting this blend for 3 months. It's finally ready.",
  "Community coffee tasting event this Saturday! Free samples of our new seasonal blend. Bring a friend and your favorite mug.",
];

export default function InputPanel({
  userContext,
  hasImage,
  isGenerating,
  canGenerate,
  onContextChange,
  onImageToggle,
  onGenerate,
}: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Content Context
      </label>
      <textarea
        value={userContext}
        onChange={(e) => onContextChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fox-400 resize-y"
        placeholder="Describe your content, scene, or what you want to post about..."
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={hasImage}
            onChange={(e) => onImageToggle(e.target.checked)}
            className="rounded border-gray-300 text-fox-500 focus:ring-fox-400"
          />
          Photo attached
        </label>

        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="px-4 py-2 bg-fox-500 text-white text-sm font-semibold rounded-lg hover:bg-fox-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Captions"}
        </button>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 mb-1.5">Try a sample:</p>
        <div className="space-y-1">
          {SAMPLE_INPUTS.map((sample, i) => (
            <button
              key={i}
              onClick={() => onContextChange(sample)}
              className="w-full text-left text-xs text-gray-500 hover:text-fox-600 hover:bg-fox-50 px-2 py-1 rounded transition-colors truncate"
            >
              {sample.slice(0, 80)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
