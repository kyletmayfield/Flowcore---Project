-- FlowCore — Initial Database Schema
-- Run this in your Supabase SQL Editor after creating your project.

-- ============================================================
-- FLOWPILOT TABLES
-- ============================================================

-- Workflows — stores workflow definitions (graph + settings)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled Workflow',
  description TEXT DEFAULT '',
  definition JSONB NOT NULL,
  settings JSONB NOT NULL DEFAULT '{"human_review_mode": "pause_on_fail", "review_timeout_seconds": 30, "default_trace_depth": "full"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Execution runs — stores full execution traces
CREATE TABLE IF NOT EXISTS execution_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  input JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'complete',
  trust_score NUMERIC NOT NULL DEFAULT 0,
  trust_grade TEXT NOT NULL DEFAULT 'A',
  node_traces JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scenario test runs — stores batch test results
CREATE TABLE IF NOT EXISTS scenario_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  total_inputs INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  overall_trust_score NUMERIC NOT NULL DEFAULT 0,
  overall_trust_grade TEXT NOT NULL DEFAULT 'A',
  grade_distribution JSONB NOT NULL DEFAULT '{"A":0,"B":0,"C":0,"D":0,"F":0}'::jsonb,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  edge_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- THESOCIALFOX TABLES
-- ============================================================

-- Personas — stores persona definitions with learned preferences
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  voice TEXT NOT NULL DEFAULT '',
  vocabulary TEXT NOT NULL DEFAULT '',
  "values" TEXT[] NOT NULL DEFAULT '{}',
  learned_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generation results — stores individual caption generations
CREATE TABLE IF NOT EXISTS generation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  confidence NUMERIC NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'C',
  reasoning JSONB NOT NULL DEFAULT '{}'::jsonb,
  defaults_applied JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_by_user BOOLEAN,
  user_edits TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_execution_runs_workflow ON execution_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_scenario_runs_workflow ON scenario_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_generation_results_persona ON generation_results(persona_id);
CREATE INDEX IF NOT EXISTS idx_generation_results_platform ON generation_results(persona_id, platform);
CREATE INDEX IF NOT EXISTS idx_personas_user ON personas(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (Enable when you add auth)
-- ============================================================

-- Uncomment these when you add Supabase Auth:
--
-- ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE execution_runs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scenario_runs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE generation_results ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can manage their own workflows"
--   ON workflows FOR ALL USING (auth.uid()::text = user_id);
-- (Add user_id column to workflows first)

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
