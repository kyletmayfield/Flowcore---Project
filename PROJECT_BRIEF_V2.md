# FlowCore — AI Workflow Engine with Trust & Observability

## Project Brief v2 — FINAL SPEC

**Author:** Claude + Kyle
**Date:** February 20, 2026
**Status:** APPROVED — All decisions finalized. Ready for development.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [The Market Gap We're Exploiting](#2-the-market-gap-were-exploiting)
3. [Three Deliverables, One Engine](#3-three-deliverables-one-engine)
4. [Architecture Overview](#4-architecture-overview)
5. [FlowCore Engine — Complete Spec](#5-flowcore-engine--complete-spec)
6. [FlowPilot — Portfolio Demo App Spec](#6-flowpilot--portfolio-demo-app-spec)
7. [TheSocialFox Integration Spec](#7-thesocialfox-integration-spec)
8. [Data Models — Complete](#8-data-models--complete)
9. [AI Prompt Architecture](#9-ai-prompt-architecture)
10. [Grading & Confidence System](#10-grading--confidence-system)
11. [Human-in-the-Loop System](#11-human-in-the-loop-system)
12. [Adaptive AI Confidence System](#12-adaptive-ai-confidence-system)
13. [Build Phases & Sequencing](#13-build-phases--sequencing)
14. [Tech Stack](#14-tech-stack)
15. [Risk Register](#15-risk-register)
16. [Interview Positioning](#16-interview-positioning)
17. [Decision Log](#17-decision-log)

---

## 1. Project Summary

We're building **FlowCore**, a reusable AI workflow orchestration engine where every AI decision is transparent, testable, graded for confidence, and optionally human-supervised. The engine powers two front-ends:

- **FlowPilot** — A visual drag-and-drop workflow builder (portfolio piece targeting HubSpot & IBM)
- **TheSocialFox** — Multi-platform caption generation with persona-driven style adaptation (Kyle's SaaS product)

### What Makes This Different From Everything Else

The AI workflow automation market (Zapier, n8n, Make, Relay.app, etc.) solves the **building** problem. Nobody solves the **trusting** problem. Our engine uniquely combines:

1. **AI Reasoning Traces** — Every AI decision shows its reasoning, factors considered, and alternatives rejected
2. **Grade-Based Confidence Scoring** — A-F letter grades on every decision, instantly understandable
3. **Conditional Human-in-the-Loop** — Low-confidence decisions pause for human input; high-confidence decisions flow automatically
4. **Scenario Testing** — Batch-run sample inputs to find edge cases before going live
5. **Workflow Trust Scores** — An overall reliability grade based on aggregated performance
6. **Adaptive AI Assessment** — Underperforming branches automatically get AI-assisted evaluation until they recover

No single competitor has any of these. We have all six.

---

## 2. The Market Gap We're Exploiting

### Competitor Landscape

| Tool | Strength | What They're Missing |
|------|----------|---------------------|
| Zapier | 8,000+ integrations, natural language builder, AI agents | AI is a black box, no reasoning visibility, rigid structure, expensive at scale |
| n8n | Open source, 70+ AI nodes, LangChain, self-hostable | Steep learning curve, no AI explainability, requires DevOps |
| Make | Visual builder, good conditional logic, 2,000+ integrations | AI bolted on not native, no reasoning transparency |
| Relay.app | Human-in-the-loop approvals | Always pauses for humans, not conditionally. Limited AI depth |
| LangFlow | Visual LangChain builder | Developer-only, no trust/testing layer, no end-user UX |
| ChatGPT Agent Builder | Part of ChatGPT ecosystem | New, clunky, limited integrations |

### The Trust Gap

MIT research found only 5% of enterprise AI pilots reach production. The technical capability exists — the confidence to deploy doesn't. Every tool comparison mentions "debugging AI workflows" as a pain point. Nobody has built the solution.

### Our Competitive Advantages Combined

We take Relay.app's human-in-the-loop concept and make it **conditional on confidence** (only pause when uncertain). We take n8n's AI-native approach and add **reasoning transparency**. We take Zapier's accessibility and add **graded trust scoring**. And we wrap it all in a **scenario testing framework** that lets users find edge cases before deployment.

---

## 3. Three Deliverables, One Engine

```
┌─────────────────────────────────────────────────────────┐
│                   FLOWCORE (Shared Engine)               │
│                                                         │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  Workflow    │ │  AI Reasoning│ │  Grade-Based     │  │
│  │  Executor   │ │  Trace       │ │  Confidence      │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  Graph       │ │  Scenario    │ │  Human-in-the-   │  │
│  │  Walker      │ │  Test Runner │ │  Loop Controller │  │
│  └─────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌──────────────────────────────┐                       │
│  │  Adaptive AI Assessment      │                       │
│  │  (auto-activates for weak    │                       │
│  │   branches, deactivates      │                       │
│  │   when recovered)            │                       │
│  └──────────────────────────────┘                       │
└──────────────────────┬──────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
   ┌────────▼────────┐  ┌────────▼────────┐
   │   FLOWPILOT     │  │  THESOCIALFOX   │
   │   (Portfolio)   │  │  (SaaS Product) │
   │                 │  │                 │
   │ • React Flow    │  │ • Multi-platform│
   │   canvas        │  │   generation    │
   │ • Drag & drop   │  │ • Persona +     │
   │   nodes         │  │   learned style │
   │ • Scenario      │  │ • Pre-gen       │
   │   test panel    │  │   confidence    │
   │ • Trust score   │  │ • Reasoning     │
   │   dashboard     │  │   trace toggle  │
   │ • Human-in-the- │  │ • Side-by-side  │
   │   loop UI       │  │   output        │
   │ • Generic use   │  │ • Selection →   │
   │   cases         │  │   persona learns│
   └─────────────────┘  └─────────────────┘
```

### Build Order (Non-Negotiable)

1. **FlowCore** — Shared engine, built and tested standalone
2. **FlowPilot** — Portfolio demo app (primary deliverable)
3. **TheSocialFox Integration** — Only after 1 and 2 are solid

---

## 4. Architecture Overview

### Core Concepts

**Workflow** — A directed graph of nodes connected by edges. Single entry point (trigger), one or more terminal nodes. Supports linear and branching paths. No parallel execution (out of scope).

**Node** — A single unit of work. Three categories:
- **Trigger nodes** — Start the workflow (manual input, webhook)
- **AI nodes** — Process data using Claude API, output a decision + reasoning trace + confidence grade
- **Action nodes** — Do something with the result (log, notify, route)

**Edge** — A connection between two nodes. Can be unconditional (always follow) or conditional (follow if condition matches AI output).

**Execution Run** — One instance of a workflow processing one input. Produces a complete trace of every node's input, output, reasoning, confidence grade, and timing.

**Scenario Test** — A batch of execution runs against sample inputs. Produces aggregated grades and an edge case report.

### Workflow Types

**Linear:**
```
[Trigger] ──→ [AI: Classify] ──→ [Action: Log Result]
```

**Branching:**
```
                              ┌─ "positive" ──→ [Send Thank You]
[Trigger] → [AI: Sentiment] ──┤─ "negative" ──→ [Create Ticket]
                              └─ "neutral"  ──→ [Log & Skip]
```

At branch points, the AI node always picks the best option. It never hard-fails. Instead, it grades its own confidence. High grades flow silently. Low grades get flagged or trigger human intervention depending on user settings.

---

## 5. FlowCore Engine — Complete Spec

### 5.1 Workflow Executor

The executor walks the workflow graph node by node, executing each node's logic and following edges based on AI output.

**Core execution logic (pseudocode):**

```
function executeWorkflow(workflow, input, userSettings):
    currentNode = findTriggerNode(workflow)
    executionTrace = []
    payload = input

    while currentNode is not null:
        result = executeNode(currentNode, payload)

        // Grade the confidence if this is an AI node
        if result.confidence exists:
            result.grade = calculateGrade(result.confidence)

        executionTrace.push({
            nodeId: currentNode.id,
            input: payload,
            output: result.output,
            reasoning: result.reasoning,
            confidence: result.confidence,
            grade: result.grade,
            duration: result.duration
        })

        payload = result.output
        outgoingEdges = getOutgoingEdges(workflow, currentNode.id)

        if outgoingEdges.length === 0:
            // Terminal node — done
            currentNode = null

        else if outgoingEdges.length === 1 and edge is unconditional:
            // Linear path — follow it
            currentNode = getNode(workflow, outgoingEdges[0].target)

        else:
            // BRANCHING — AI always picks best option
            matchingEdge = findBestMatchingEdge(outgoingEdges, result.output)
            
            if result.grade === "F" and userSettings.humanReview === true:
                // Human-in-the-loop: pause for user input
                humanChoice = await requestHumanIntervention(
                    result,
                    outgoingEdges,
                    userSettings.reviewTimeout  // 15-30 seconds
                )
                if humanChoice is not null:
                    matchingEdge = humanChoice
                // else: timeout, AI's best pick stands

            currentNode = getNode(workflow, matchingEdge.target)

    // Calculate workflow trust score
    trustScore = calculateWorkflowGrade(executionTrace)

    return {
        trace: executionTrace,
        trustScore: trustScore,
        status: "complete"
    }
```

**Key behavior:**
- The AI **always** selects the best matching branch — it never refuses to proceed
- If confidence is below 59% (grade F), the behavior depends on user settings
- The execution trace captures everything regardless of grade — full transparency
- The workflow trust score is the average of all AI node grades across the run

### 5.2 AI Reasoning Trace

Every AI node returns a structured reasoning object alongside its decision:

```json
{
    "decision": "negative",
    "confidence": 0.87,
    "grade": "B",
    "reasoning": {
        "summary": "The message contains explicit frustration language and a request for escalation.",
        "factors": [
            {
                "factor": "Language tone",
                "observation": "Words like 'unacceptable' and 'furious' indicate strong negative sentiment.",
                "weight": "high"
            },
            {
                "factor": "Action request",
                "observation": "Customer explicitly asks to speak with a manager.",
                "weight": "medium"
            },
            {
                "factor": "Prior context",
                "observation": "No prior interaction history provided, so no repeat-contact signal.",
                "weight": "low"
            }
        ],
        "alternatives_considered": [
            {
                "option": "neutral",
                "why_rejected": "The intensity of language goes beyond neutral dissatisfaction."
            }
        ]
    }
}
```

**Trace depth is configurable per node with three levels:**
- **Full** (default): Summary + all factors + alternatives considered
- **Summary**: Summary + top 2 factors, no alternatives
- **Off**: Decision and confidence only, no reasoning

In FlowPilot, default is Full. In TheSocialFox, default is Full in advanced view, Summary in standard view.

### 5.3 Scenario Test Runner

Takes a workflow + array of sample inputs. Runs each through the executor. Aggregates results.

**Test input sources (in priority order):**
1. **Manual entry** — User types test cases one by one (Phase 1)
2. **CSV/JSON upload** — User uploads a file of test cases (Phase 1)
3. **AI-generated** — User describes their use case, Claude generates diverse sample inputs including edge cases (Phase 2)

**Scenario test output structure:**

```json
{
    "workflow_id": "wf_123",
    "total_inputs": 10,
    "completed": 10,
    "failed": 0,
    "grade_distribution": {
        "A": 4,
        "B": 3,
        "C": 1,
        "D": 1,
        "F": 1
    },
    "overall_trust_grade": "B",
    "overall_trust_score": 79.4,
    "per_input": [
        {
            "id": "t1",
            "data_preview": "I love your product!",
            "path_taken": "positive → send_thanks",
            "confidence": 0.94,
            "grade": "A",
            "color": "green"
        },
        {
            "id": "t4",
            "data_preview": "lol ok whatever 🙄",
            "path_taken": "neutral → log_skip",
            "confidence": 0.52,
            "grade": "F",
            "color": "red"
        }
    ],
    "edge_cases": [
        {
            "input_id": "t4",
            "concern": "Sarcasm detection is inherently unreliable. Classified as neutral but likely negative.",
            "suggestion": "Consider adding a human review trigger for low-confidence classifications."
        }
    ]
}
```

The edge case analysis is AI-powered — after all scenarios run, a follow-up Claude call reviews low-confidence results and generates actionable suggestions.

---

## 6. FlowPilot — Portfolio Demo App Spec

### 6.1 Purpose

The visual workflow builder that demonstrates FlowCore in interviews. Standalone web app with a business-relevant demo scenario.

### 6.2 Primary Demo Scenario: Support Ticket Triage

Pre-built workflow that comes loaded by default:

```
                                ┌─ "billing_angry" ──→ [Notify: Senior Agent + Priority Flag]
[Manual Input] → [AI: Classify  ├─ "billing_general" ──→ [Notify: Billing Team]
                  Category &    ├─ "technical_issue" ──→ [Notify: Tech Support]
                  Sentiment]    ├─ "feature_request" ──→ [Log: Product Backlog]
                                └─ "general_question" ──→ [Notify: FAQ Bot]
```

This demo shows:
- A single AI node making a multi-dimensional decision (category + sentiment combined)
- Five-way branching based on the classification
- Reasoning trace showing why "billing_angry" was chosen over "technical_issue" for an ambiguous message
- Scenario testing revealing edge cases in sarcasm and mixed-intent messages
- The trust score for the overall workflow
- Human-in-the-loop triggering on an F-graded decision

### 6.3 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  FlowPilot                        [Save] [Test] [Run]   │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│     WORKFLOW CANVAS          │     RIGHT PANEL          │
│     (React Flow)             │                          │
│                              │  ┌────────────────────┐  │
│   ┌──────┐                   │  │ NODE CONFIGURATOR  │  │
│   │Trigger│                  │  │ (when node selected)│  │
│   └──┬───┘                   │  │                    │  │
│      │                       │  │ • Name & type      │  │
│   ┌──▼───────┐               │  │ • AI instruction   │  │
│   │AI: Classify│             │  │ • Output categories│  │
│   └─┬──┬──┬──┘               │  │ • Branch conditions│  │
│     │  │  │                  │  │ • Trace depth      │  │
│  ┌──▼┐┌▼─┐┌▼──┐             │  │   [Full|Summary|Off│  │
│  │Act││Act││Act│             │  └────────────────────┘  │
│  └───┘└───┘└───┘             │                          │
│                              │  ┌────────────────────┐  │
│                              │  │ EXECUTION TRACE    │  │
│                              │  │ (after a run)      │  │
│                              │  │                    │  │
│                              │  │ Step 1: Trigger ✅  │  │
│                              │  │ Step 2: Classify   │  │
│                              │  │   Grade: B (82%)   │  │
│                              │  │   [View Reasoning] │  │
│                              │  │ Step 3: Notify ✅   │  │
│                              │  │                    │  │
│                              │  │ Run Grade: B       │  │
│                              │  └────────────────────┘  │
├──────────────────────────────┴──────────────────────────┤
│                 BOTTOM PANEL                             │
│                                                          │
│  [Scenario Tests]  [Trust Score]  [Run History]          │
│                                                          │
│  Input 1: "I love it"         → positive    A  94% 🟢   │
│  Input 2: "This is broken"    → negative    A  91% 🟢   │
│  Input 3: "Maybe refund?"     → negative    D  62% 🟠   │
│  Input 4: "lol ok 🙄"         → neutral     F  52% 🔴   │
│                                                          │
│  Workflow Trust Grade: B (79.4/100)                      │
│  Edge Cases Found: 2  [View Report]                      │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ ⚠️ HUMAN REVIEW TRIGGERED (Input 4)          │        │
│  │ AI chose: neutral (52% — F)                  │        │
│  │                                               │        │
│  │ Override: [positive] [negative] [neutral]     │        │
│  │                          Timer: 0:23 / 0:30   │        │
│  └──────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

### 6.4 Node Types

**Phase 1 — Core Set (5 nodes):**

| Node | Type | Description |
|------|------|-------------|
| Manual Input | Trigger | User types or pastes data to test |
| AI Classifier | AI | Assigns a category from a defined list, returns reasoning trace |
| AI Sentiment Analyzer | AI | Positive/negative/neutral + nuance, returns reasoning trace |
| Notification | Action | Simulated email/Slack output with formatted message |
| Logger | Action | Writes to execution log, always available |

**Phase 2 — Expansion (3 additional nodes, easiest to hardest):**

| Node | Type | Difficulty | Description |
|------|------|------------|-------------|
| Webhook Trigger | Trigger | Easy | Accepts POST data via HTTP endpoint |
| AI Extractor | AI | Medium | Pulls structured data from unstructured input |
| Custom AI Node | AI | Hard | Freeform prompt editor, user defines their own instruction and output schema |

### 6.5 Settings Panel

Global workflow settings accessible from the FlowPilot toolbar:

```
WORKFLOW SETTINGS
─────────────────
Human Review Mode:
  ○ Auto-accept all (AI chooses best path regardless of grade)
  ● Pause on failing grade (F) for human review
  
Review Timeout: [30] seconds
  (If timer expires, AI's best choice proceeds)

Default Trace Depth:
  ● Full  ○ Summary  ○ Off
```

---

## 7. TheSocialFox Integration Spec

### 7.1 Workflow Under the Hood

Users never see a workflow canvas in TheSocialFox. The workflow runs invisibly:

```
┌───────────────────────────────────────────────────────┐
│  User provides: photo + context + persona selection   │
└──────────────────────┬────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  TRIGGER: Content Analysis                            │
│  AI analyzes input and determines content type:       │
│  product shot, lifestyle, event, behind-the-scenes,   │
│  testimonial, educational, etc.                       │
│                                                        │
│  Output: { type: "product_shot",                       │
│            mood: "aspirational",                       │
│            key_elements: ["warm lighting", "minimal    │
│            background", "hero product"] }              │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  BRANCH: Generate for each selected platform          │
│  Same persona, different platform contexts             │
│                                                        │
│  ┌─ Instagram: long-form, storytelling, hashtags      │
│  ├─ Twitter/X: under 280, punchy, minimal hashtags    │
│  ├─ LinkedIn: professional, industry insight          │
│  └─ Facebook: community tone, shareable, personal     │
│                                                        │
│  Each generation uses: PERSONA × PLATFORM CONTEXT     │
│  × CONTENT ANALYSIS                                    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  OUTPUT: Side-by-side captions                        │
│  Each with: caption, grade, reasoning (toggle)        │
│  User selects favorites → persona learns              │
└──────────────────────────────────────────────────────┘
```

### 7.2 The Persona + Platform Learning Model

**Core insight:** A persona is *who* you are. A platform is *where* you are. Same person, different rooms.

**How it works:**

The persona stores the base voice — tone, vocabulary, values, brand identity. There are NO separate platform profiles to configure. Instead, each platform starts with smart defaults:

```
PLATFORM DEFAULTS (starting point for every persona):
├── Instagram: long-form friendly, visual storytelling, 5-10 hashtags, emoji OK
├── Twitter/X: under 280 chars, conversational, 0-1 hashtags, punchy
├── LinkedIn: professional framing, industry context, 3-5 hashtags, insight-driven
└── Facebook: community-oriented, medium length, shareable, personal touch
```

**The learning loop:**
1. System generates captions using persona + platform defaults
2. User edits captions (shortens, adds humor, removes hashtags, changes tone)
3. User selects favorites from the side-by-side output
4. The persona engine absorbs these platform-specific preferences over time
5. Future generations for that platform reflect learned adjustments

No configuration screens. No upfront setup. The platform voice develops organically through usage. A law firm's LinkedIn will naturally become more formal while their Instagram stays professional but warmer — because that's how the user edits and selects.

**Data model for learning:**
```
persona.learned_preferences = {
    instagram: {
        generation_count: 47,
        avg_edits_per_generation: 1.2,
        common_edits: ["shorter_hooks", "more_emoji", "less_formal"],
        selection_patterns: ["prefers_question_hooks", "favors_storytelling"]
    },
    linkedin: {
        generation_count: 23,
        avg_edits_per_generation: 0.4,
        common_edits: ["add_industry_stats"],
        selection_patterns: ["prefers_insight_driven", "avoids_emoji"]
    },
    // ...
}
```

### 7.3 Pre-Generation Confidence

Before generating, the system calculates a confidence estimate using **heuristics only** (no API call). This is fast, free, and deterministic.

**Inputs:**
- `generation_count` per platform (more history = higher confidence)
- `avg_edits_per_generation` per platform (fewer edits = better calibration)
- Content input quality (image provided? context description length?)
- Content type familiarity (has persona generated product shots before?)

**Display:**
```
Pre-generation confidence:
  Instagram:  A (94%)  🟢  Strong match — 47 prior generations, low edit rate
  LinkedIn:   B (81%)  🔵  Good match — 23 prior generations
  Twitter/X:  F (48%)  🔴  Weak match — only 2 prior generations
  Facebook:   C (71%)  🟡  Moderate match — suggest selecting more favorites

💡 Tip: Generate a few Twitter/X posts and select your favorites to help
   your persona learn your short-form voice.
```

### 7.4 Adaptive AI Assessment for Weak Platforms

When a platform's average confidence stays below 60% (grade F) across recent generations:

1. The system automatically activates AI-assisted pre-generation assessment for that platform
2. This means one lightweight Claude call before generation to better analyze persona-platform fit
3. As the user generates more content, selects favorites, and makes edits, the platform confidence rises
4. Once the platform's rolling average crosses back above 60%, the AI assessment deactivates
5. System returns to heuristics-only for that platform

**The threshold check is a simple database query:**
```sql
SELECT AVG(confidence) 
FROM generation_results 
WHERE persona_id = ? AND platform = ? 
ORDER BY created_at DESC 
LIMIT 20
```

If result < 0.60, activate AI assessment. If result >= 0.60, deactivate. The data already exists in the generation_results table.

### 7.5 Advanced View Toggle

Default view: clean multi-platform output with captions and grades.

Advanced toggle reveals:
- Full reasoning trace per caption
- Platform filter details that were applied
- Confidence breakdown by factor
- Edit history patterns the persona has learned
- Adaptive AI status per platform (active/inactive)

---

## 8. Data Models — Complete

### 8.1 Workflow Definition

```typescript
interface Workflow {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    settings: WorkflowSettings;
}

interface WorkflowSettings {
    human_review_mode: "auto_accept" | "pause_on_fail";
    review_timeout_seconds: number;       // 15-30, default 30
    default_trace_depth: "full" | "summary" | "off";
}

interface WorkflowNode {
    id: string;
    type: "trigger" | "ai" | "action";
    subtype: string;
    position: { x: number; y: number };
    config: NodeConfig;
}

interface NodeConfig {
    label: string;
    // For AI nodes:
    instruction?: string;
    output_schema?: string[];
    trace_depth?: "full" | "summary" | "off";  // overrides workflow default
    // For trigger nodes:
    trigger_type?: string;
    // For action nodes:
    action_type?: string;
    action_config?: Record<string, unknown>;
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    condition?: EdgeCondition;
}

interface EdgeCondition {
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than";
    value: string | number;
}
```

### 8.2 Execution Trace

```typescript
interface ExecutionRun {
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

interface NodeTrace {
    node_id: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    reasoning?: ReasoningTrace;
    confidence?: number;
    grade?: Grade;
    duration_ms: number;
    edge_taken?: string;
    human_override?: boolean;   // true if user overrode AI's choice
}

interface ReasoningTrace {
    summary: string;
    factors: ReasoningFactor[];
    alternatives_considered: Alternative[];
}

interface ReasoningFactor {
    factor: string;
    observation: string;
    weight: "high" | "medium" | "low";
}

interface Alternative {
    option: string;
    why_rejected: string;
}

type Grade = "A" | "B" | "C" | "D" | "F";
```

### 8.3 Scenario Test

```typescript
interface ScenarioTest {
    id: string;
    workflow_id: string;
    created_at: string;
    test_inputs: TestInput[];
    results: ScenarioResults;
}

interface TestInput {
    id: string;
    label?: string;
    data: Record<string, unknown>;
    source: "manual" | "csv" | "ai_generated";
}

interface ScenarioResults {
    total: number;
    completed: number;
    failed: number;
    grade_distribution: Record<Grade, number>;
    overall_trust_score: number;
    overall_trust_grade: Grade;
    per_input: InputResult[];
    edge_cases: EdgeCase[];
}

interface InputResult {
    input_id: string;
    data_preview: string;
    path_taken: string;
    confidence: number;
    grade: Grade;
    color: string;
    human_override: boolean;
}

interface EdgeCase {
    input_id: string;
    concern: string;
    suggestion: string;
}
```

### 8.4 TheSocialFox Models

```typescript
interface Persona {
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

interface PlatformLearning {
    instagram?: PlatformHistory;
    twitter?: PlatformHistory;
    linkedin?: PlatformHistory;
    facebook?: PlatformHistory;
}

interface PlatformHistory {
    generation_count: number;
    avg_edits_per_generation: number;
    common_edits: string[];
    selection_patterns: string[];
    avg_confidence: number;
    adaptive_ai_active: boolean;
}

interface PlatformDefaults {
    platform: "instagram" | "twitter" | "linkedin" | "facebook";
    max_length: number | null;
    hashtag_range: { min: number; max: number };
    emoji_allowed: boolean;
    tone_modifier: string;
    structure_hint: string;
}

interface GenerationResult {
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
```

---

## 9. AI Prompt Architecture

### 9.1 Base AI Node Prompt (FlowCore — used by FlowPilot)

```
You are an AI decision node in an automated workflow. Your job is to analyze the provided input and make the best possible decision.

INSTRUCTION FROM WORKFLOW DESIGNER:
{node_instruction}

EXPECTED OUTPUT CATEGORIES:
{output_schema}

INPUT DATA:
{input_payload}

TRACE DEPTH: {trace_depth}

You MUST respond in valid JSON and nothing else.

If trace_depth is "full":
{
    "decision": "<one of the expected output categories>",
    "confidence": <number between 0.00 and 1.00>,
    "reasoning": {
        "summary": "<1-2 sentence explanation of your decision>",
        "factors": [
            {
                "factor": "<what you considered>",
                "observation": "<what you observed in the input>",
                "weight": "<high|medium|low>"
            }
        ],
        "alternatives_considered": [
            {
                "option": "<another category you considered>",
                "why_rejected": "<why you didn't choose it>"
            }
        ]
    }
}

If trace_depth is "summary":
{
    "decision": "<one of the expected output categories>",
    "confidence": <number between 0.00 and 1.00>,
    "reasoning": {
        "summary": "<1-2 sentence explanation>",
        "factors": [<top 2 factors only>]
    }
}

If trace_depth is "off":
{
    "decision": "<one of the expected output categories>",
    "confidence": <number between 0.00 and 1.00>
}

RULES:
- Your decision MUST be one of the expected output categories. Never invent new ones.
- Your confidence MUST reflect genuine uncertainty. Do not default to high confidence.
- You MUST always pick the best option, even if uncertain. Never refuse to decide.
- When trace is full, you MUST consider at least one alternative and explain why you rejected it.
- Reference specific content from the input in your observations.
- A confidence of 0.59 or below means you are essentially guessing. Be honest about this.
```

### 9.2 TheSocialFox Caption Prompt

```
You are a social media content creator embodying a specific persona, generating content adapted to a specific platform.

PERSONA:
{persona_definition}

PLATFORM: {platform}
PLATFORM CONTEXT:
{platform_defaults — adjusted by any learned_preferences for this platform}

CONTENT ANALYSIS:
{content_analysis_output}

USER CONTEXT:
{user_provided_context}

TRACE DEPTH: {trace_depth}

Generate a caption for {platform} that is authentically the persona's voice, adapted to the platform's norms and constraints.

Respond in valid JSON:
{
    "caption": "<the generated caption>",
    "confidence": <0.00 to 1.00>,
    "reasoning": {
        "summary": "<1-2 sentence explanation of your creative choices>",
        "factors": [
            {
                "factor": "<aspect you considered>",
                "observation": "<how it shaped the caption>",
                "weight": "<high|medium|low>"
            }
        ],
        "alternatives_considered": [
            {
                "option": "<different creative approach you considered>",
                "why_rejected": "<why you went with your chosen approach>"
            }
        ]
    }
}

RULES:
- Stay within the platform's constraints (length, hashtags, tone).
- Sound like the persona, not like generic AI. Use their vocabulary and cadence.
- Your confidence should reflect how well the input aligns with this persona's strengths on this platform.
- If the persona has limited history on this platform, be honest with a lower confidence score.
```

### 9.3 Edge Case Analyzer Prompt (for Scenario Testing)

```
You are reviewing the results of a batch test run on an AI workflow. Your job is to identify concerning patterns and provide actionable suggestions.

WORKFLOW DESCRIPTION:
{workflow_description}

TEST RESULTS:
{array of per_input results, focusing on grades D and F}

For each concerning result, provide:
{
    "edge_cases": [
        {
            "input_id": "<which test input>",
            "concern": "<what's concerning about this result>",
            "suggestion": "<specific, actionable advice to improve the workflow>"
        }
    ]
}

Focus on:
- Inputs where the AI grade was D or F
- Cases where the decision seems plausible but the confidence was low (uncertain correct answers are still risky)
- Patterns across multiple low-confidence results that suggest a systemic gap
- Practical suggestions: adding branches, rewording AI instructions, adding human review triggers
```

---

## 10. Grading & Confidence System

### 10.1 Grade Scale

| Grade | Score Range | Color | Meaning |
|-------|-----------|-------|---------|
| A | 90-100% | 🟢 Green | High confidence — flows automatically |
| B | 80-89% | 🔵 Blue | Good confidence — flows automatically |
| C | 70-79% | 🟡 Yellow | Moderate confidence — flows, flagged in trace |
| D | 60-69% | 🟠 Orange | Low confidence — passes but notable |
| F | 0-59% | 🔴 Red | Failing — triggers human review if enabled |

### 10.2 Grade Calculation

```typescript
function calculateGrade(confidence: number): Grade {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
}

function getGradeColor(grade: Grade): string {
    const colors = { A: "green", B: "blue", C: "yellow", D: "orange", F: "red" };
    return colors[grade];
}
```

### 10.3 Workflow Trust Score

The workflow's overall trust grade is calculated from all AI node grades in a single run (or averaged across scenario test runs):

```typescript
function calculateWorkflowGrade(nodeTraces: NodeTrace[]): { score: number; grade: Grade } {
    const aiNodes = nodeTraces.filter(t => t.confidence !== undefined);
    if (aiNodes.length === 0) return { score: 100, grade: "A" };

    const avgConfidence = aiNodes.reduce((sum, n) => sum + n.confidence, 0) / aiNodes.length;
    const score = Math.round(avgConfidence * 100);
    const grade = calculateGrade(avgConfidence);

    return { score, grade };
}
```

For scenario tests, the trust score averages across ALL runs in the batch, giving a holistic view of workflow reliability.

---

## 11. Human-in-the-Loop System

### 11.1 How It Works

The human-in-the-loop system only activates when ALL of these conditions are true:
1. The workflow setting `human_review_mode` is set to `"pause_on_fail"`
2. An AI node returns a grade of F (confidence below 59%)
3. The workflow is being executed in interactive mode (not batch scenario testing)

When triggered:
1. Execution pauses at the branch point
2. The UI displays the AI's reasoning trace and its best guess
3. All available branch options are shown as clickable choices
4. A countdown timer starts (configurable: 15-30 seconds, default 30)
5. If the user selects a branch: that branch is taken, the trace records `human_override: true`
6. If the timer expires: the AI's original best guess proceeds, trace records the timeout

### 11.2 User Settings

Two modes available in workflow settings:

**Auto-accept all:** AI always picks the best path. Low-confidence decisions are graded and flagged in the trace but never pause execution. Best for automated/background workflows.

**Pause on fail:** F-graded decisions pause for human review with a timeout. Best for interactive workflows where a human is monitoring.

### 11.3 During Scenario Testing

Human-in-the-loop is **always disabled** during batch scenario testing. The point of scenario testing is to see how the AI performs unassisted. All decisions are auto-accepted, and F-grades are captured in the edge case report for review.

---

## 12. Adaptive AI Confidence System

### 12.1 TheSocialFox Only

This system applies exclusively to TheSocialFox's platform confidence, not to FlowPilot (where workflows are ad-hoc and don't have persistent performance history).

### 12.2 Mechanism

Each platform track's its rolling average confidence across the most recent 20 generations for a given persona:

```
Platform rolling average ≥ 60%  →  Heuristics-only pre-gen confidence (free, fast)
Platform rolling average < 60%  →  AI-assisted pre-gen assessment activates (one API call)
Platform rolling average recovers to ≥ 60%  →  AI assessment deactivates
```

### 12.3 Implementation

```typescript
async function getPreGenConfidence(personaId: string, platform: string): Promise<ConfidenceEstimate> {
    // Query last 20 generations for this persona + platform
    const recentResults = await supabase
        .from("generation_results")
        .select("confidence")
        .eq("persona_id", personaId)
        .eq("platform", platform)
        .order("created_at", { ascending: false })
        .limit(20);

    const avgConfidence = average(recentResults.map(r => r.confidence));
    const needsAI = avgConfidence < 0.60;

    if (needsAI) {
        // Activate AI-assisted assessment
        const aiAssessment = await callClaudeForAssessment(personaId, platform);
        return {
            confidence: aiAssessment.confidence,
            grade: calculateGrade(aiAssessment.confidence),
            source: "ai_assisted",
            message: aiAssessment.recommendation
        };
    } else {
        // Heuristic assessment
        const heuristic = calculateHeuristicConfidence(personaId, platform, recentResults);
        return {
            confidence: heuristic.confidence,
            grade: calculateGrade(heuristic.confidence),
            source: "heuristic",
            message: heuristic.tip
        };
    }
}
```

---

## 13. Build Phases & Sequencing

### Phase 1 — FlowCore Engine (~1 week)

**Goal:** Working execution engine testable via function calls. No UI.

**Deliverables:**
- [ ] Workflow definition parser (reads JSON graph)
- [ ] Graph walker with unconditional edge following (linear)
- [ ] Graph walker with conditional edge evaluation (branching)
- [ ] AI node executor (Claude API call, structured reasoning output)
- [ ] Grade calculation (confidence → letter grade + color)
- [ ] Execution trace collector
- [ ] Workflow trust score calculator
- [ ] Unit tests: linear workflow, branching workflow, F-grade handling

**Done when:** `executeWorkflow(workflowDef, inputData)` returns a complete trace with grades at every AI node. Testable from the command line.

---

### Phase 2 — FlowPilot MVP (~2 weeks)

**Goal:** Visual workflow builder with live execution and trace display.

**Deliverables:**
- [ ] React Flow canvas with drag-and-drop
- [ ] 5 node types: Manual Trigger, AI Classifier, AI Sentiment, Notification, Logger
- [ ] Node configuration panel (right side)
- [ ] Edge creation with condition configuration for branches
- [ ] "Run" button — executes workflow, displays trace with grades
- [ ] Execution trace panel with expandable reasoning at each node
- [ ] Pre-built support ticket triage demo workflow
- [ ] Workflow settings panel (human review mode, timeout, trace depth)
- [ ] Save/load workflows via Supabase
- [ ] Human-in-the-loop UI (review prompt, countdown timer, override buttons)

**Done when:** Someone can open FlowPilot, load the demo, type a test message, hit Run, see the graded trace, and have human review trigger on a low-confidence input.

---

### Phase 3 — Scenario Testing & Trust Score (~1 week)

**Goal:** Batch testing that makes FlowPilot's differentiator visible and tangible.

**Deliverables:**
- [ ] Scenario test input panel (manual entry + CSV upload)
- [ ] Batch execution runner (sequential with rate limiting)
- [ ] Results matrix with letter grades and color coding
- [ ] Grade distribution summary (A: 4, B: 3, C: 1, D: 1, F: 1)
- [ ] Workflow trust grade display
- [ ] AI-generated edge case report for D and F results
- [ ] Human-in-the-loop disabled during batch testing

**Done when:** Load 10+ test inputs, run them all, see a graded matrix with a trust score and flagged edge cases.

---

### Phase 3.5 — Node Expansion (~3-5 days)

**Goal:** Expand from 5 to 8 node types.

**Build order (easiest to hardest):**
- [ ] Webhook Trigger (easy — HTTP endpoint accepting POST)
- [ ] AI Extractor (medium — structured data extraction from unstructured input)
- [ ] Custom AI Node (hard — freeform prompt editor with user-defined output schema)

**Done when:** All 8 node types work in the canvas and execute correctly in the engine.

---

### Phase 4 — TheSocialFox Integration (~1 week) — ONLY IF PHASES 1-3 ARE SOLID

**Goal:** Multi-platform caption generation powered by FlowCore.

**Deliverables:**
- [ ] Platform default definitions (Instagram, X, LinkedIn, Facebook)
- [ ] Content analysis trigger using FlowCore AI node
- [ ] Multi-platform generation using branching execution
- [ ] Side-by-side caption output UI
- [ ] Pre-generation confidence display (heuristic-based)
- [ ] User selection tracking → persona learning loop
- [ ] Platform-specific learning data storage in Supabase
- [ ] Reasoning trace toggle (advanced view)
- [ ] Adaptive AI assessment activation/deactivation

**Done when:** A user provides input, sees confidence grades per platform, generates captions for all 4 platforms, toggles reasoning, selects favorites, and the persona visibly improves on subsequent generations.

---

### Phase 5 — Polish & Portfolio Prep (~1 week)

**Deliverables:**
- [ ] FlowPilot landing page
- [ ] README with architecture diagram and tech decisions
- [ ] Clean GitHub repo (monorepo structure)
- [ ] Deploy FlowPilot to Vercel
- [ ] 2-minute demo video
- [ ] Interview talking points prepared
- [ ] AI-generated scenario test cases (Phase 2 of test input sources)

---

## 14. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18+ | Kyle's primary framework, HubSpot uses React |
| Workflow Canvas | React Flow | Purpose-built for node-based editors |
| Styling | Tailwind CSS | Fast iteration, clean defaults |
| Backend / Auth / DB | Supabase | Kyle's existing expertise from TheSocialFox |
| AI | Claude API (Anthropic) | Kyle's existing integration experience |
| Shared Engine | TypeScript | Type safety for graph/trace data models |
| Monorepo | pnpm workspaces | Modern, fast, used by platform companies |
| Deployment | Vercel | Free tier, instant deploys |

### Monorepo Structure

```
flowcore-project/
├── packages/
│   └── flowcore/              # Shared engine
│       ├── src/
│       │   ├── executor.ts        # Workflow execution engine
│       │   ├── graph.ts           # Graph walking & edge evaluation
│       │   ├── ai-node.ts         # Claude API integration
│       │   ├── grading.ts         # Confidence → grade calculation
│       │   ├── reasoning.ts       # Reasoning trace formatting
│       │   ├── scenario-runner.ts # Batch test execution
│       │   ├── human-review.ts    # Human-in-the-loop controller
│       │   └── types.ts           # All TypeScript interfaces
│       ├── tests/
│       └── package.json
├── apps/
│   ├── flowpilot/             # Portfolio demo app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Canvas/        # React Flow canvas
│   │   │   │   ├── NodeConfig/    # Right panel config
│   │   │   │   ├── TracePanel/    # Execution trace display
│   │   │   │   ├── ScenarioTest/  # Bottom panel testing
│   │   │   │   ├── HumanReview/   # Review prompt + timer
│   │   │   │   └── Settings/      # Workflow settings
│   │   │   ├── nodes/             # Custom React Flow node types
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   └── lib/               # Supabase client, helpers
│   │   └── package.json
│   └── socialfox-adapter/     # TheSocialFox integration layer
│       ├── src/
│       │   ├── platform-defaults.ts
│       │   ├── content-analyzer.ts
│       │   ├── caption-generator.ts
│       │   ├── confidence-heuristics.ts
│       │   ├── adaptive-assessment.ts
│       │   └── persona-learner.ts
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
├── PROJECT_BRIEF.md           # This document
└── README.md
```

---

## 15. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Execution engine complexity | Medium | High | Linear-first. Add branching only after linear passes all tests. |
| Claude API costs during dev | Medium | Medium | Mock AI responses during UI work. Cache responses for identical inputs. Only hit real API for integration tests. |
| Scope creep from TheSocialFox | High | High | Phases are sequential. Phase 4 only begins when 1-3 are demo-ready. |
| Time constraint (job + TSF) | High | High | 1-2 hours weekday evenings, 4-6 hours weekend days. If behind, cut Phase 4, polish 2-3. |
| Human-in-the-loop timing complexity | Medium | Medium | Start with simple setTimeout. No WebSocket needed — FlowPilot is single-user. |
| Prompt engineering iteration | Medium | Medium | Expect 3-5 iterations on the base prompt to get consistent structured output. Budget time for this in Phase 1. |
| React Flow learning curve | Low | Low | Well-documented, large community, Kyle's React experience transfers. |
| pnpm workspace setup | Low | Low | 10-minute learning curve from npm. Nearly identical commands. |

---

## 16. Interview Positioning

### The Story

"I researched the AI workflow automation space — Zapier, n8n, Make — and noticed they all solve the building problem, but none of them solve the trusting problem. Every comparison mentions debugging AI as a pain point. So I built a workflow automation tool where AI decisions are transparent, testable, and scored for confidence — because the hardest part of AI automation isn't building it, it's knowing you can rely on it."

### For HubSpot

"Your platform is moving toward AI-powered workflow automation — Breeze agents, Sales Workspace, lifecycle orchestration. The biggest blocker for SMB adoption is trust. Business owners won't turn on an AI workflow that routes their leads unless they understand why the AI made each decision. FlowPilot solves that with reasoning traces, a grade-based confidence system, and conditional human-in-the-loop review that only pauses when the AI is uncertain. The same engine runs in production in my SaaS product, TheSocialFox, powering multi-platform content generation — same persona, different platform environments, each with graded AI reasoning."

### For IBM

"Your watsonx positioning is safe, explainable, responsible AI. Enterprise clients demand auditability before deploying AI workflows. FlowPilot gives every AI decision a reasoning trace, runs scenario tests with graded results, and produces a trust score before deployment. The human-in-the-loop system ensures uncertain decisions get human oversight without slowing down confident ones. I also run the same engine in my SaaS product, proving the architecture works in production, not just demos."

### Technical Talking Points

- **Graph execution:** "The engine walks a directed acyclic graph, evaluating edge conditions at branch points against structured AI output. It never hard-fails — it always picks the best option but grades its confidence honestly."
- **Grading system:** "Every AI decision gets a letter grade from A to F based on confidence. The workflow trust score is the average across all AI nodes — like a GPA for your automation."
- **Human-in-the-loop:** "I combined Relay.app's human review concept with confidence-based activation. High-confidence decisions flow automatically. F-grades pause for a configurable timeout window — if the user doesn't respond, the AI's best guess proceeds. Workflows never get stuck."
- **Adaptive confidence:** "In TheSocialFox, platforms that consistently underperform automatically get AI-assisted evaluation. Once they recover above a passing grade, the AI assessment shuts off. The data for this is already captured in normal execution — it's just a threshold check on existing scores."
- **Architecture:** "FlowCore is a standalone TypeScript module in a pnpm monorepo, consumed by both the visual builder and my SaaS product. Same engine, two front-ends — platform thinking."

---

## 17. Decision Log

All decisions finalized during v1 review:

| # | Decision | Final Answer | Rationale |
|---|----------|-------------|-----------|
| 1 | Branch fallback | AI always picks best option, graded with school-grade system. F triggers human review if enabled. | Never hard-fail. Be honest about confidence instead. |
| 2 | Confidence display | Letter grades with percentage. Color-coded: A=green, B=blue, C=yellow, D=orange, F=red | Universally understood. Instant visual scanning. |
| 3 | Test input sources | Manual + CSV (Phase 1), AI-generated (Phase 2) | Prioritize core functionality, add AI generation as enhancement. |
| 4 | Demo scenario | Support Ticket Triage | Universal, demonstrates branching, compelling reasoning traces, works for both target companies. |
| 5 | Node count | 5 core (Phase 1), expand to 8 (Phase 3.5), easiest to hardest | Ship functional set fast, expand methodically. |
| 6 | Platform filters | Smart defaults, learned through usage. No separate config UI. | The persona engine already learns from edits and selections. Don't over-build what the system already does. |
| 7 | Pre-gen confidence | Heuristics by default. AI assessment auto-activates for platforms averaging below 60% (F). | Threshold check on existing data — simple, adaptive, cost-efficient. |
| 8 | Trace depth | Configurable per node. Default: Full. Options: Full / Summary / Off | Flexibility for power users and cost management. |
| 9 | Repo structure | pnpm monorepo with workspaces | Modern, professional, matches platform company practices. |
| 10 | Human-in-the-loop | Conditional on F grade + user setting. 15-30s timeout with AI fallback. Disabled during scenario testing. | Best of both worlds — human oversight when needed, automatic flow when confident. |

---

## Next Steps

1. Kyle takes this brief to Claude Code
2. Begin Phase 1: FlowCore engine
3. First file to create: `packages/flowcore/src/types.ts` (all interfaces)
4. Second file: `packages/flowcore/src/grading.ts` (simple, testable, foundational)
5. Third file: `packages/flowcore/src/executor.ts` (the heart)

---

*This is the canonical spec. If it's not in this document, it's not in scope. Every line of code traces back to something here.*
