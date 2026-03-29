import { useState, useRef, useCallback } from "react";
import {
  buildTestCaseGeneratorPrompt,
  parseGeneratedTestCases,
} from "@flowcore/engine";
import { callClaude, ClaudeAPIError } from "../../lib/claude";

export interface ScenarioInput {
  id: string;
  label: string;
  data: Record<string, unknown>;
  source: "manual" | "csv" | "ai_generated";
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
  { id: "s7", label: "", data: { message: "lol ok whatever \u{1F644}" }, source: "manual" },
  { id: "s8", label: "", data: { message: "Your app crashed again. This is the third time this week." }, source: "manual" },
  { id: "s9", label: "", data: { message: "Maybe I should just get a refund?" }, source: "manual" },
  { id: "s10", label: "", data: { message: "Can you integrate with Slack?" }, source: "manual" },
];

/**
 * Generates test cases using the real Claude API.
 * Falls back to mock data if the API is unavailable.
 */
async function generateTestCases(
  useCase: string,
  count: number
): Promise<ScenarioInput[]> {
  const prompt = buildTestCaseGeneratorPrompt(
    useCase || "Customer support ticket classification workflow",
    ["Trigger: Incoming Message", "AI: Classify Intent", "Action: Route to Team"],
    ["complaint", "question", "feedback", "bug_report", "feature_request"],
    count
  );

  try {
    const raw = await callClaude(prompt);
    const parsed = parseGeneratedTestCases(raw);
    return parsed.map((tc) => ({
      id: tc.id,
      label: tc.label ?? "",
      data: tc.data,
      source: "ai_generated" as const,
    }));
  } catch (err) {
    if (err instanceof ClaudeAPIError && err.useMock) {
      console.warn("Claude API not configured — using mock test cases");
    } else {
      console.warn("Test case generation failed, using mock fallback:", err);
    }
    return mockTestCases(count);
  }
}

/** Fallback mock test cases when Claude API is unavailable */
function mockTestCases(count: number): ScenarioInput[] {
  const mocks: ScenarioInput[] = [
    { id: `gen_${Date.now()}_1`, label: "sarcastic complaint", data: { message: "Oh wonderful, the app crashed AGAIN. Truly a delightful experience." }, source: "ai_generated" },
    { id: `gen_${Date.now()}_2`, label: "multi-intent message", data: { message: "I need to change my email address and also why was I charged $50 last month? Plus the mobile app is really slow." }, source: "ai_generated" },
    { id: `gen_${Date.now()}_3`, label: "very short message", data: { message: "help" }, source: "ai_generated" },
    { id: `gen_${Date.now()}_4`, label: "ambiguous tone", data: { message: "I guess this works... not really what I expected though." }, source: "ai_generated" },
    { id: `gen_${Date.now()}_5`, label: "long detailed message", data: { message: "Hi there, I've been a customer for about 3 years now and I've generally been happy with the service. However, over the past two weeks I've noticed that my dashboard takes over 30 seconds to load, the export feature gives me a 500 error about half the time, and yesterday I was logged out mid-session and lost a report I'd been working on for an hour. I'm seriously considering switching to a competitor unless these issues are resolved soon." }, source: "ai_generated" },
    { id: `gen_${Date.now()}_6`, label: "emoji only", data: { message: "\u{1F621}\u{1F621}\u{1F621}" }, source: "ai_generated" },
    { id: `gen_${Date.now()}_7`, label: "mixed language", data: { message: "Merci but your product is broken, kann ich einen Refund bekommen?" }, source: "ai_generated" },
    { id: `gen_${Date.now()}_8`, label: "all caps aggressive", data: { message: "THIS IS UNACCEPTABLE I WANT MY MONEY BACK RIGHT NOW" }, source: "ai_generated" },
    { id: `gen_${Date.now()}_9`, label: "backhanded compliment", data: { message: "Your support team is way better than your actual product." }, source: "ai_generated" },
    { id: `gen_${Date.now()}_10`, label: "question disguised as complaint", data: { message: "Is there a reason the pricing page shows different prices than what I was charged, or is that just a feature?" }, source: "ai_generated" },
  ];
  return mocks.slice(0, count);
}

export default function ScenarioTestPanel({ onRunScenario, isRunning }: Props) {
  const [inputs, setInputs] = useState<ScenarioInput[]>(defaultInputs);
  const [newInput, setNewInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(100);

  // AI generation state
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [useCaseDescription, setUseCaseDescription] = useState("");
  const [generateCount, setGenerateCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const handleGenerateTestCases = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const generated = await generateTestCases(
        useCaseDescription,
        generateCount
      );
      setInputs((prev) => [...prev, ...generated]);
      setShowGenerateForm(false);
      setUseCaseDescription("");
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Failed to generate test cases"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [useCaseDescription, generateCount]);

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
            onClick={() => setShowGenerateForm((prev) => !prev)}
            disabled={isRunning || isGenerating}
            className="px-3 py-1 text-xs font-medium text-purple-600 border border-purple-300 rounded hover:bg-purple-50 disabled:opacity-50"
          >
            Generate Test Cases
          </button>
          <button
            onClick={() => onRunScenario(inputs)}
            disabled={isRunning || inputs.length === 0}
            className="px-4 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? "Running..." : `Run All (${inputs.length})`}
          </button>
        </div>
      </div>

      {/* AI Test Case Generation — inline form */}
      {showGenerateForm && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-purple-700">
              AI-Generated Test Cases
            </h4>
            <button
              onClick={() => setShowGenerateForm(false)}
              className="text-purple-400 hover:text-purple-600 text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-[11px] text-purple-600">
            Describe your use case and Claude will generate diverse test inputs
            including edge cases (ambiguous, sarcastic, multi-intent, short/long
            messages, and more).
          </p>
          <textarea
            value={useCaseDescription}
            onChange={(e) => setUseCaseDescription(e.target.value)}
            placeholder="e.g. Customer support ticket classification — routes messages to billing, technical support, or sales teams based on intent and urgency..."
            className="w-full px-3 py-2 text-xs border border-purple-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            rows={3}
          />
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-purple-600 flex items-center gap-1">
              Count:
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
                className="px-2 py-0.5 text-xs border border-purple-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </label>
            <button
              onClick={handleGenerateTestCases}
              disabled={isGenerating}
              className="px-4 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${generateCount} Test Cases`
              )}
            </button>
          </div>
          {generateError && (
            <p className="text-[11px] text-red-600 bg-red-50 rounded px-2 py-1">
              {generateError}
            </p>
          )}
        </div>
      )}

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
            {input.source === "ai_generated" && input.label && (
              <span className="text-[10px] text-purple-500 italic truncate max-w-[100px]">
                {input.label}
              </span>
            )}
            <span
              className={`text-[10px] ${
                input.source === "ai_generated"
                  ? "text-purple-400"
                  : "text-gray-400"
              }`}
            >
              {input.source === "ai_generated" ? "ai" : input.source}
            </span>
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
