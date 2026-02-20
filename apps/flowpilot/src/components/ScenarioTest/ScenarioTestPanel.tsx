import { useState, useRef } from "react";

export interface ScenarioInput {
  id: string;
  label: string;
  data: Record<string, unknown>;
  source: "manual" | "csv";
}

interface Props {
  onRunScenario: (inputs: ScenarioInput[]) => void;
  isRunning: boolean;
}

const defaultInputs: ScenarioInput[] = [
  { id: "s1", label: "", data: { message: "I love your product!" }, source: "manual" },
  { id: "s2", label: "", data: { message: "I've been charged twice and I'm furious. Get me a manager." }, source: "manual" },
  { id: "s3", label: "", data: { message: "How do I update my billing address?" }, source: "manual" },
  { id: "s4", label: "", data: { message: "My dashboard keeps showing an error when I try to export." }, source: "manual" },
  { id: "s5", label: "", data: { message: "It would be great if you added dark mode." }, source: "manual" },
  { id: "s6", label: "", data: { message: "What are your business hours?" }, source: "manual" },
  { id: "s7", label: "", data: { message: "lol ok whatever 🙄" }, source: "manual" },
  { id: "s8", label: "", data: { message: "Your app crashed again. This is the third time this week." }, source: "manual" },
  { id: "s9", label: "", data: { message: "Maybe I should just get a refund?" }, source: "manual" },
  { id: "s10", label: "", data: { message: "Can you integrate with Slack?" }, source: "manual" },
];

export default function ScenarioTestPanel({ onRunScenario, isRunning }: Props) {
  const [inputs, setInputs] = useState<ScenarioInput[]>(defaultInputs);
  const [newInput, setNewInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(100);

  const addInput = () => {
    if (!newInput.trim()) return;
    const id = `s_${idCounter.current++}`;
    setInputs((prev) => [
      ...prev,
      { id, label: "", data: { message: newInput.trim() }, source: "manual" },
    ]);
    setNewInput("");
  };

  const removeInput = (id: string) => {
    setInputs((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      // Skip header if it looks like one
      const start = lines[0]?.toLowerCase().includes("message") ? 1 : 0;
      const csvInputs: ScenarioInput[] = lines.slice(start).map((line, i) => ({
        id: `csv_${idCounter.current++}`,
        label: "",
        data: { message: line.trim().replace(/^"|"$/g, "") },
        source: "csv" as const,
      }));
      setInputs((prev) => [...prev, ...csvInputs]);
    };
    reader.readAsText(file);
    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        const jsonInputs: ScenarioInput[] = items.map((item, i) => ({
          id: `json_${idCounter.current++}`,
          label: "",
          data: typeof item === "string" ? { message: item } : item,
          source: "csv" as const,
        }));
        setInputs((prev) => [...prev, ...jsonInputs]);
      } catch {
        // ignore bad JSON
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Scenario Test Inputs ({inputs.length})
        </h3>
        <div className="flex gap-2">
          <label className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            Upload CSV
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <label className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            Upload JSON
            <input
              type="file"
              accept=".json"
              onChange={handleJSONUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => onRunScenario(inputs)}
            disabled={isRunning || inputs.length === 0}
            className="px-4 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? "Running..." : `Run All (${inputs.length})`}
          </button>
        </div>
      </div>

      {/* Add manual input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newInput}
          onChange={(e) => setNewInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addInput()}
          placeholder="Add a test message..."
          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addInput}
          disabled={!newInput.trim()}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Input list */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {inputs.map((input, i) => (
          <div key={input.id} className="flex items-center gap-2 text-xs group">
            <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
            <span className="flex-1 text-gray-600 font-mono truncate">
              {String((input.data as any).message ?? JSON.stringify(input.data))}
            </span>
            <span className="text-[10px] text-gray-400">{input.source}</span>
            <button
              onClick={() => removeInput(input.id)}
              className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
