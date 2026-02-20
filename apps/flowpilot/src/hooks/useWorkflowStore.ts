import { useState, useCallback } from "react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import type { Workflow, WorkflowSettings, ExecutionRun } from "@flowcore/engine";
import { demoWorkflow, workflowToReactFlow } from "../lib/demoWorkflow";
import { supabase } from "../lib/supabase";

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

/** Check if Supabase is configured (has real credentials) */
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return Boolean(url && !url.includes("your-") && url.includes("supabase"));
}

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

  const saveWorkflow = useCallback(async () => {
    const data = { workflow, nodes, edges, settings };

    // Always save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Try Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("workflows").upsert({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          definition: { nodes, edges, workflow },
          settings,
        });
        if (error) {
          console.warn("Supabase save failed, using localStorage:", error.message);
        }
      } catch {
        console.warn("Supabase unavailable, saved to localStorage");
      }
    }
  }, [workflow, nodes, edges, settings]);

  const loadWorkflow = useCallback(async () => {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("workflows")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          const def = data.definition as any;
          setWorkflow(def.workflow);
          setNodes(def.nodes);
          setEdges(def.edges);
          setSettings(data.settings as WorkflowSettings);
          return;
        }
      } catch {
        // Fall through to localStorage
      }
    }

    // Fallback: load from localStorage
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
