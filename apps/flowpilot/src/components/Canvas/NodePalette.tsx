const nodeTemplates = [
  {
    type: "manualTrigger",
    label: "Manual Input",
    category: "TRIGGER",
    color: "border-indigo-300 bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    type: "aiClassifier",
    label: "AI Classifier",
    category: "AI",
    color: "border-purple-300 bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    type: "aiSentiment",
    label: "AI Sentiment",
    category: "AI",
    color: "border-teal-300 bg-teal-50",
    textColor: "text-teal-600",
  },
  {
    type: "notification",
    label: "Notification",
    category: "ACTION",
    color: "border-amber-300 bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    type: "logger",
    label: "Logger",
    category: "ACTION",
    color: "border-gray-300 bg-gray-50",
    textColor: "text-gray-600",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: string, label: string) => void;
}

export default function NodePalette({ isOpen, onClose, onAddNode }: Props) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-52">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase">Add Node</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-2 space-y-1">
        {nodeTemplates.map((t) => (
          <button
            key={t.type}
            onClick={() => {
              onAddNode(t.type, t.label);
              onClose();
            }}
            className={`w-full text-left px-3 py-2 rounded border ${t.color} hover:opacity-80 transition-opacity`}
          >
            <div className={`text-[10px] font-semibold ${t.textColor} uppercase`}>
              {t.category}
            </div>
            <div className="text-sm font-medium text-gray-700">{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
