import { useState } from "react";
import type { ExecutionRun } from "@flowcore/engine";
import ScenarioTestPanel from "./ScenarioTestPanel";
import type { ScenarioInput } from "./ScenarioTestPanel";
import ScenarioResults from "./ScenarioResults";
import type { ScenarioResultData, EdgeCase } from "./ScenarioResults";

interface Props {
  executionRun: ExecutionRun | null;
  runHistory: ExecutionRun[];
  // Scenario test props
  scenarioResults: ScenarioResultData[];
  scenarioEdgeCases: EdgeCase[];
  scenarioRunning: boolean;
  scenarioProgress: { current: number; total: number };
  onRunScenario: (inputs: ScenarioInput[]) => void;
}

const gradeColors: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-yellow-600",
  D: "text-orange-600",
  F: "text-red-600",
};

const gradeBg: Record<string, string> = {
  A: "bg-green-100",
  B: "bg-blue-100",
  C: "bg-yellow-100",
  D: "bg-orange-100",
  F: "bg-red-100",
};

type Tab = "scenarios" | "results" | "history" | "trust";

export default function BottomPanel({
  executionRun,
  runHistory,
  scenarioResults,
  scenarioEdgeCases,
  scenarioRunning,
  scenarioProgress,
  onRunScenario,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("scenarios");

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100">
        <TabButton active={activeTab === "scenarios"} onClick={() => setActiveTab("scenarios")}>
          Scenario Tests
        </TabButton>
        <TabButton active={activeTab === "results"} onClick={() => setActiveTab("results")}>
          Results {scenarioResults.length > 0 && `(${scenarioResults.length})`}
        </TabButton>
        <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
          Run History {runHistory.length > 0 && `(${runHistory.length})`}
        </TabButton>
        <TabButton active={activeTab === "trust"} onClick={() => setActiveTab("trust")}>
          Trust Score
        </TabButton>
        {scenarioRunning && (
          <span className="text-xs text-blue-500 animate-pulse ml-auto">
            Running {scenarioProgress.current}/{scenarioProgress.total}...
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {activeTab === "scenarios" && (
          <ScenarioTestPanel onRunScenario={onRunScenario} isRunning={scenarioRunning} />
        )}
        {activeTab === "results" && (
          <ScenarioResults results={scenarioResults} edgeCases={scenarioEdgeCases} />
        )}
        {activeTab === "history" && <HistoryTab runs={runHistory} />}
        {activeTab === "trust" && <TrustTab runs={[...runHistory, ...scenarioResults.map((r) => r.run)]} />}
      </div>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function HistoryTab({ runs }: { runs: ExecutionRun[] }) {
  if (runs.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Run the workflow to see history here</div>;
  }

  return (
    <div className="p-4 space-y-1.5">
      {[...runs].reverse().map((run, i) => {
        const inputPreview = JSON.stringify(run.input).slice(0, 80);
        const pathTaken = run.node_traces
          .filter((t) => t.output?.decision)
          .map((t) => (t.output as any).decision)
          .join(" -> ");

        return (
          <div key={run.id} className="flex items-center gap-3 text-xs">
            <span className="text-gray-400 w-4">#{runs.length - i}</span>
            <span className="flex-1 truncate text-gray-600 font-mono">{inputPreview}</span>
            {pathTaken && (
              <span className="text-gray-500 truncate max-w-[200px]">{pathTaken}</span>
            )}
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${gradeColors[run.trust_grade]} ${gradeBg[run.trust_grade]}`}
            >
              {run.trust_grade} {run.trust_score}%
            </span>
            {run.status === "human_override" && (
              <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-[10px]">
                OVERRIDE
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TrustTab({ runs }: { runs: ExecutionRun[] }) {
  if (runs.length === 0) {
    return <div className="p-4 text-sm text-gray-400">Run tests to see the trust score</div>;
  }

  const avgScore = Math.round(runs.reduce((s, r) => s + r.trust_score, 0) / runs.length);
  const avgGrade =
    avgScore >= 90 ? "A" : avgScore >= 80 ? "B" : avgScore >= 70 ? "C" : avgScore >= 60 ? "D" : "F";

  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  runs.forEach((r) => distribution[r.trust_grade]++);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className={`text-3xl font-bold ${gradeColors[avgGrade]}`}>
          {avgGrade}
        </div>
        <div>
          <div className="text-sm text-gray-700 font-medium">
            Workflow Trust Grade: {avgGrade} ({avgScore}/100)
          </div>
          <div className="text-xs text-gray-500">
            Based on {runs.length} execution{runs.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {Object.entries(distribution).map(([grade, count]) => (
          <div
            key={grade}
            className={`flex-1 text-center py-2 rounded ${gradeBg[grade]} ${gradeColors[grade]}`}
          >
            <div className="text-lg font-bold">{count}</div>
            <div className="text-[10px] font-semibold uppercase">{grade}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
