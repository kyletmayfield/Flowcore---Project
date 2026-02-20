import { useState, useCallback } from "react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import type { Workflow, WorkflowSettings, ExecutionRun } from "@flowcore/engine";
import { demoWorkflow, workflowToReactFlow } from "../lib/demoWorkflow";

export interface WorkflowStore {
  // Workflow data
  workflow: Workflow;
  nodes: Node[];
  edges: Edge[];
  settings: WorkflowSettings;

  // Selection
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;

  // React Flow callbacks
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

  // Execution
  executionRun: ExecutionRun | null;
  setExecutionRun: (run: ExecutionRun | null) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;

  // Human review
  humanReviewPending: HumanReviewState | null;
  setHumanReviewPending: (review: HumanReviewState | null) => void;

  // Settings
  updateSettings: (updates: Partial<WorkflowSettings>) => void;

  // Save/load
  saveWorkflow: () => void;
  loadWorkflow: () => void;
  loadDemo: () => void;
}

export interface HumanReviewState {
  nodeId: string;
  aiDecision: string;
  aiConfidence: number;
  aiGrade: string;
  reasoning: any;
  availableOptions: string[];
  timeoutSeconds: number;
  resolve: (selectedOption: string | null) => void;
}

const STORAGE_KEY = "flowpilot_workflow";

export function useWorkflowStore(): WorkflowStore {
  const initial = workflowToReactFlow(demoWorkflow);

  const [workflow, setWorkflow] = useState<Workflow>(demoWorkflow);
  const [nodes, setNodes] = useState<Node[]>(initial.nodes);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);
  const [settings, setSettings] = useState<WorkflowSettings>(demoWorkflow.settings);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [executionRun, setExecutionRun] = useState<ExecutionRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [humanReviewPending, setHumanReviewPending] = useState<HumanReviewState | null>(null);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const updateSettings = useCallback((updates: Partial<WorkflowSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setWorkflow((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const saveWorkflow = useCallback(() => {
    const data = JSON.stringify({ workflow, nodes, edges, settings });
    localStorage.setItem(STORAGE_KEY, data);
  }, [workflow, nodes, edges, settings]);

  const loadWorkflow = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setWorkflow(data.workflow);
      setNodes(data.nodes);
      setEdges(data.edges);
      setSettings(data.settings);
    } catch {
      // ignore corrupt data
    }
  }, []);

  const loadDemo = useCallback(() => {
    const demo = workflowToReactFlow(demoWorkflow);
    setWorkflow(demoWorkflow);
    setNodes(demo.nodes);
    setEdges(demo.edges);
    setSettings(demoWorkflow.settings);
    setExecutionRun(null);
    setSelectedNodeId(null);
  }, []);

  return {
    workflow,
    nodes,
    edges,
    settings,
    selectedNodeId,
    selectNode,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    executionRun,
    setExecutionRun,
    isRunning,
    setIsRunning,
    humanReviewPending,
    setHumanReviewPending,
    updateSettings,
    saveWorkflow,
    loadWorkflow,
    loadDemo,
  };
}
