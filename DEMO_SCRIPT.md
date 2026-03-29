# FlowPilot — 2-Minute Demo Video Script

## Setup Before Recording

- Have FlowPilot open in a browser (deployed or local)
- Start on the landing page
- Have a few test messages ready to paste
- Screen recording tool with mic

---

## Script (2:00)

### [0:00–0:15] Hook + Landing Page

> "Every AI workflow tool on the market — Zapier, n8n, Make — solves the building problem. But none of them solve the trusting problem. FlowPilot does."

**Action:** Show the landing page briefly, then click "Launch Demo".

---

### [0:15–0:35] The Canvas

> "This is FlowPilot — a visual workflow builder where every AI decision is transparent, testable, and graded for confidence."

**Action:** Pan around the pre-loaded support ticket triage workflow. Point out the trigger node, the AI classifier, and the five routing branches.

> "This demo workflow classifies incoming support messages and routes them — billing, technical, feature requests, or general."

---

### [0:35–0:55] Run a Workflow

> "Let's run it. I'll type an angry billing complaint."

**Action:** Click "Run", type: `I've been charged twice and I'm furious. Get me a manager now.`

> "Watch the trace — the AI classified this as 'billing angry' with a B grade, 91% confidence. Click 'View Reasoning' and you can see exactly why: it detected frustration language, a manager request, and billing keywords. It even shows what alternatives it considered and why it rejected them."

**Action:** Expand the reasoning trace in the right panel.

---

### [0:55–1:15] Human-in-the-Loop

> "Now here's where it gets interesting. Let me send something ambiguous."

**Action:** Run again with: `lol ok whatever`

> "The AI classified this as 'general question' but with an F grade — 43% confidence. Because I have human review enabled for failing grades, the workflow paused. I can override the AI's choice, or let the timer expire and accept the AI's best guess. The trace records either outcome."

**Action:** Show the human review banner with the countdown timer, then click an override option.

---

### [1:15–1:40] Scenario Testing

> "But you don't want to test one message at a time. That's what scenario testing is for."

**Action:** Click the Scenario Tests tab. Show the pre-loaded 10 test inputs.

> "I run all 10 at once. The results show a graded matrix — greens, blues, and reds. The workflow trust grade is a B at 79%. And the AI automatically flags edge cases — here it caught that sarcasm detection is unreliable, and suggests adding a human review trigger."

**Action:** Point out the grade distribution, trust score, and edge case report.

---

### [1:40–2:00] Close + The Engine

> "The engine behind this — FlowCore — is a standalone TypeScript module. Same engine powers TheSocialFox, my SaaS product for multi-platform social media content. Same reasoning traces, same confidence grades, same architecture — two front-ends, one trust layer."

> "Every AI decision is visible, every workflow is testable, and every confidence score is honest. That's FlowPilot."

**Action:** End on the canvas with the completed execution trace visible.

---

## Recording Tips

- Keep the browser zoomed to ~125% so UI elements are clearly visible
- Use a dark desktop background so the white UI pops
- Record at 1080p or higher
- Speak at a measured pace — 2 minutes goes fast
- Practice the click sequences 2-3 times before recording
- If you stumble, just re-record that section — you can cut in post
