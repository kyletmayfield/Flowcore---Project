import type { WorkflowSettings } from "@flowcore/engine";

interface Props {
  settings: WorkflowSettings;
  onUpdate: (updates: Partial<WorkflowSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onUpdate, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Human Review Mode */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Human Review Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="reviewMode"
                checked={settings.human_review_mode === "auto_accept"}
                onChange={() => onUpdate({ human_review_mode: "auto_accept" })}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">Auto-accept all</div>
                <div className="text-xs text-gray-500">
                  AI chooses best path regardless of grade. Low-confidence decisions are flagged in
                  the trace but never pause execution.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="reviewMode"
                checked={settings.human_review_mode === "pause_on_fail"}
                onChange={() => onUpdate({ human_review_mode: "pause_on_fail" })}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">Pause on failing grade (F)</div>
                <div className="text-xs text-gray-500">
                  F-graded decisions pause for human review with a timeout. If the timer expires,
                  AI's best guess proceeds.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Review Timeout */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Timeout
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={15}
              max={30}
              value={settings.review_timeout_seconds}
              onChange={(e) =>
                onUpdate({ review_timeout_seconds: Number(e.target.value) })
              }
              className="flex-1"
            />
            <span className="text-sm font-mono text-gray-600 w-8 text-right">
              {settings.review_timeout_seconds}s
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            If timer expires, AI's best choice proceeds.
          </p>
        </div>

        {/* Default Trace Depth */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Trace Depth
          </label>
          <div className="flex gap-2">
            {(["full", "summary", "off"] as const).map((depth) => (
              <button
                key={depth}
                onClick={() => onUpdate({ default_trace_depth: depth })}
                className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                  settings.default_trace_depth === depth
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {depth.charAt(0).toUpperCase() + depth.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
