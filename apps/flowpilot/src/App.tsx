import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes/nodeTypes";
import type { FlowNodeData } from "./nodes/nodeTypes";
import { useWorkflowStore } from "./hooks/useWorkflowStore";
import { useWorkflowRunner, createAIExecutor } from "./hooks/useWorkflowRunner";
import { useScenarioRunner } from "./hooks/useScenarioRunner";
import NodeConfigPanel from "./components/NodeConfig/NodeConfigPanel";
import TracePanel from "./components/TracePanel/TracePanel";
import HumanReviewPanel from "./components/HumanReview/HumanReviewPanel";
import SettingsPanel from "./components/Settings/SettingsPanel";
import BottomPanel from "./components/ScenarioTest/BottomPanel";
import RunInputModal from "./components/Canvas/RunInputModal";
import NodePalette from "./components/Canvas/NodePalette";
import LandingPage from "./components/LandingPage";

function FlowPilotApp() {
  const store = useWorkflowStore();
  const [showRunModal, setShowRunModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const nodeIdCounter = useRef(100);

  const { run } = useWorkflowRunner({
    workflow: store.workflow,
    settings: store.settings,
    nodes: store.nodes,
    setNodes: store.setNodes,
    setIsRunning: store.setIsRunning,
    setExecutionRun: (result) => {
      store.setExecutionRun(result);
      if (result) {
        setRunHistory((prev) => [...prev, result]);
      }
    },
    setHumanReviewPending: store.setHumanReviewPending,
  });

  const scenario = useScenarioRunner({
    workflow: store.workflow,
    settings: store.settings,
    aiExecutor: createAIExecutor(),
  });

  const onConnect = useCallback(
    (connection: Connection) => {
      store.setEdges((eds: Edge[]) => addEdge({ ...connection, style: { strokeWidth: 2 } }, eds));
    },
    [store.setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      store.selectNode(node.id);
    },
    [store.selectNode]
  );

  const onPaneClick = useCallback(() => {
    store.selectNode(null);
  }, [store.selectNode]);

  const handleNodeUpdate = useCallback(
    (nodeId: string, dataUpdates: Partial<FlowNodeData>) => {
      store.setNodes((nds: Node[]) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdates } } : n
        )
      );
    },
    [store.setNodes]
  );

  const handleAddNode = useCallback(
    (type: string, label: string) => {
      const id = `node_${nodeIdCounter.current++}`;
      const subtypeMap: Record<string, { nodeType: string; subtype: string }> = {
        manualTrigger: { nodeType: "trigger", subtype: "manual" },
        webhookTrigger: { nodeType: "trigger", subtype: "webhook" },
        aiClassifier: { nodeType: "ai", subtype: "classifier" },
        aiSentiment: { nodeType: "ai", subtype: "sentiment" },
        aiExtractor: { nodeType: "ai", subtype: "extractor" },
        customAI: { nodeType: "ai", subtype: "custom" },
        notification: { nodeType: "action", subtype: "notification" },
        logger: { nodeType: "action", subtype: "logger" },
      };
      const mapping = subtypeMap[type] ?? { nodeType: "action", subtype: "unknown" };
      const newNode: Node = {
        id,
        type,
        position: { x: 250, y: 150 },
        data: {
          label,
          type: mapping.nodeType,
          subtype: mapping.subtype,
          outputSchema: mapping.nodeType === "ai" ? ["option_1", "option_2"] : undefined,
        },
      };
      store.setNodes((nds: Node[]) => [...nds, newNode]);
    },
    [store.setNodes]
  );

  const selectedNode = store.nodes.find((n) => n.id === store.selectedNodeId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">FlowPilot</h1>
          <span className="text-xs text-gray-400 font-mono">{store.workflow.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPalette((p) => !p)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            + Add Node
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Settings
          </button>
          <button
            onClick={store.saveWorkflow}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Save
          </button>
          <button
            onClick={store.loadDemo}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Load Demo
          </button>
          <button
            onClick={() => setShowRunModal(true)}
            disabled={store.isRunning}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {store.isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <main className="flex-1 relative">
          <ReactFlow
            nodes={store.nodes}
            edges={store.edges}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{ style: { strokeWidth: 2 } }}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeStrokeWidth={2}
              pannable
              zoomable
              style={{ width: 120, height: 80 }}
            />
          </ReactFlow>

          <NodePalette
            isOpen={showPalette}
            onClose={() => setShowPalette(false)}
            onAddNode={handleAddNode}
          />
        </main>

        {/* Right panel */}
        <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
          {store.executionRun && !store.selectedNodeId ? (
            <TracePanel
              executionRun={store.executionRun}
              workflowNodes={store.nodes as any}
            />
          ) : (
            <NodeConfigPanel node={selectedNode} onUpdate={handleNodeUpdate} />
          )}
        </aside>
      </div>

      {/* Human review banner */}
      {store.humanReviewPending && (
        <HumanReviewPanel review={store.humanReviewPending} />
      )}

      {/* Bottom panel */}
      <div className="h-64 border-t border-gray-200 bg-white overflow-hidden flex flex-col shrink-0">
        <BottomPanel
          executionRun={store.executionRun}
          runHistory={runHistory}
          scenarioResults={scenario.results}
          scenarioEdgeCases={scenario.edgeCases}
          scenarioRunning={scenario.isRunning}
          scenarioProgress={scenario.progress}
          onRunScenario={scenario.runScenario}
        />
      </div>

      {/* Modals */}
      <RunInputModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        onRun={(input) => run(input)}
      />
      <SettingsPanel
        settings={store.settings}
        onUpdate={store.updateSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <ReactFlowProvider>
      <FlowPilotApp />
    </ReactFlowProvider>
  );
}
