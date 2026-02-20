import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRun: (input: Record<string, unknown>) => void;
}

const sampleInputs = [
  "I've been charged twice for my subscription and I'm furious. I want to speak to a manager immediately.",
  "How do I update my billing address?",
  "My dashboard keeps showing an error when I try to export reports.",
  "It would be great if you could add a dark mode option to the app.",
  "What are your business hours?",
  "lol ok whatever 🙄",
];

export default function RunInputModal({ isOpen, onClose, onRun }: Props) {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleRun = () => {
    if (!input.trim()) return;
    onRun({ message: input.trim() });
    onClose();
  };

  const handleSample = (sample: string) => {
    setInput(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Run Workflow</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter a support ticket message to test the triage workflow.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-3"
          placeholder="Type a support message here..."
          autoFocus
        />

        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">
            Or try a sample:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleInputs.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleSample(sample)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors text-left max-w-full truncate"
              >
                {sample.slice(0, 60)}{sample.length > 60 ? "..." : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={!input.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
