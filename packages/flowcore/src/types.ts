// ============================================================
// FlowCore — Type Definitions
// All TypeScript interfaces for the workflow engine
// ============================================================

// --- Grading ---

export type Grade = "A" | "B" | "C" | "D" | "F";

export type GradeColor = "green" | "blue" | "yellow" | "orange" | "red";

// --- Workflow Definition ---

export interface Workflow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: WorkflowSettings;
}

export interface WorkflowSettings {
  human_review_mode: "auto_accept" | "pause_on_fail";
  review_timeout_seconds: number; // 15-30, default 30
  default_trace_depth: TraceDepth;
}

export type TraceDepth = "full" | "summary" | "off";

export interface WorkflowNode {
  id: string;
  type: "trigger" | "ai" | "action";
  subtype: string;
  position: { x: number; y: number };
  config: NodeConfig;
}

export interface NodeConfig {
  label: string;
  // For AI nodes:
  instruction?: string;
  output_schema?: string[];
  trace_depth?: TraceDepth; // overrides workflow default
  // For trigger nodes:
  trigger_type?: string;
  // For action nodes:
  action_type?: string;
  action_config?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: EdgeCondition;
}

export interface EdgeCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: string | number;
}

// --- Execution Trace ---

export interface ExecutionRun {
  id: string;
  workflow_id: string;
  input: Record<string, unknown>;
  started_at: string;
  completed_at: string;
  status: "complete" | "human_override";
  trust_score: number;
  trust_grade: Grade;
  node_traces: NodeTrace[];
}

export interface NodeTrace {
  node_id: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning?: ReasoningTrace;
  confidence?: number;
  grade?: Grade;
  duration_ms: number;
  edge_taken?: string;
  human_override?: boolean; // true if user overrode AI's choice
}

export interface ReasoningTrace {
  summary: string;
  factors: ReasoningFactor[];
  alternatives_considered: Alternative[];
}

export interface ReasoningFactor {
  factor: string;
  observation: string;
  weight: "high" | "medium" | "low";
}

export interface Alternative {
  option: string;
  why_rejected: string;
}

// --- Scenario Testing ---

export interface ScenarioTest {
  id: string;
  workflow_id: string;
  created_at: string;
  test_inputs: TestInput[];
  results: ScenarioResults;
}

export interface TestInput {
  id: string;
  label?: string;
  data: Record<string, unknown>;
  source: "manual" | "csv" | "ai_generated";
}

export interface ScenarioResults {
  total: number;
  completed: number;
  failed: number;
  grade_distribution: Record<Grade, number>;
  overall_trust_score: number;
  overall_trust_grade: Grade;
  per_input: InputResult[];
  edge_cases: EdgeCase[];
}

export interface InputResult {
  input_id: string;
  data_preview: string;
  path_taken: string;
  confidence: number;
  grade: Grade;
  color: GradeColor;
  human_override: boolean;
}

export interface EdgeCase {
  input_id: string;
  concern: string;
  suggestion: string;
}

// --- Human-in-the-Loop ---

export interface HumanReviewRequest {
  execution_id: string;
  node_id: string;
  ai_decision: string;
  ai_confidence: number;
  ai_grade: Grade;
  reasoning: ReasoningTrace;
  available_options: string[];
  timeout_seconds: number;
}

export interface HumanReviewResponse {
  selected_option: string | null; // null = timeout, AI choice stands
  responded_at: string | null;
  timed_out: boolean;
}

// --- TheSocialFox Models ---

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  voice: string;
  vocabulary: string;
  values: string[];
  learned_preferences: PlatformLearning;
  created_at: string;
  updated_at: string;
}

export type Platform = "instagram" | "twitter" | "linkedin" | "facebook";

export interface PlatformLearning {
  instagram?: PlatformHistory;
  twitter?: PlatformHistory;
  linkedin?: PlatformHistory;
  facebook?: PlatformHistory;
}

export interface PlatformHistory {
  generation_count: number;
  avg_edits_per_generation: number;
  common_edits: string[];
  selection_patterns: string[];
  avg_confidence: number;
  adaptive_ai_active: boolean;
}

export interface PlatformDefaults {
  platform: Platform;
  max_length: number | null;
  hashtag_range: { min: number; max: number };
  emoji_allowed: boolean;
  tone_modifier: string;
  structure_hint: string;
}

export interface GenerationResult {
  id: string;
  persona_id: string;
  platform: string;
  caption: string;
  confidence: number;
  grade: Grade;
  reasoning: ReasoningTrace;
  defaults_applied: PlatformDefaults;
  selected_by_user: boolean | null;
  user_edits: string | null;
  created_at: string;
}

// --- Confidence Estimate (used by adaptive AI) ---

export interface ConfidenceEstimate {
  confidence: number;
  grade: Grade;
  source: "heuristic" | "ai_assisted";
  message: string;
}
