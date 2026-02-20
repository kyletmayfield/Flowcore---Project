interface LandingPageProps {
  onLaunch: () => void;
}

const features = [
  {
    title: "AI Reasoning Traces",
    description:
      "Full transparency into every AI decision. Inspect step-by-step reasoning chains so you always know why the model chose what it did.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Grade-Based Confidence (A\u2013F)",
    description:
      "Every AI output is assigned a letter grade from A to F. Instantly gauge reliability without parsing raw probability scores.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    color: "text-green-600 bg-green-50",
  },
  {
    title: "Conditional Human-in-the-Loop",
    description:
      "Low-confidence outputs automatically pause for human review. High-confidence results flow through, keeping speed without sacrificing safety.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "Scenario Testing",
    description:
      "Run edge-case and adversarial scenarios against your workflow before it goes live. Catch failures in staging, not production.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "text-amber-600 bg-amber-50",
  },
  {
    title: "Workflow Trust Scores",
    description:
      "Aggregate confidence across every node into a single trust score for the entire workflow run. One number, total clarity.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    title: "Adaptive AI Assessment",
    description:
      "Confidence thresholds and grading criteria adapt over time based on historical accuracy, getting smarter with every run.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: "text-rose-600 bg-rose-50",
  },
];

const techStack = [
  { name: "React", bg: "bg-sky-100 text-sky-800" },
  { name: "TypeScript", bg: "bg-blue-100 text-blue-800" },
  { name: "React Flow", bg: "bg-violet-100 text-violet-800" },
  { name: "Tailwind CSS", bg: "bg-teal-100 text-teal-800" },
  { name: "Claude API", bg: "bg-amber-100 text-amber-800" },
  { name: "Supabase", bg: "bg-emerald-100 text-emerald-800" },
  { name: "pnpm workspaces", bg: "bg-orange-100 text-orange-800" },
];

const gradeColors: Record<string, string> = {
  A: "bg-grade-A",
  B: "bg-grade-B",
  C: "bg-grade-C",
  D: "bg-grade-D",
  F: "bg-grade-F",
};

export default function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-8 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
            Flow<span className="text-blue-600">Pilot</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
            AI workflows you can trust&nbsp;&mdash; built with transparency, graded confidence, and
            human oversight.
          </p>

          {/* Grade badges preview */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Object.entries(gradeColors).map(([letter, bg]) => (
              <span
                key={letter}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold text-white ${bg} shadow-sm`}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onLaunch}
            className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Launch Demo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900">Key Differentiators</h2>
        <p className="mt-2 text-center text-gray-500 max-w-xl mx-auto">
          FlowPilot is not another drag-and-drop builder. Every feature is designed to make AI
          workflows auditable, testable, and safe.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-900">Tech Stack</h2>
        <p className="mt-2 text-center text-gray-500">
          A modern, type-safe monorepo built for production readiness.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {techStack.map((t) => (
            <span
              key={t.name}
              className={`px-4 py-2 rounded-full text-sm font-medium ${t.bg}`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── TheSocialFox Integration ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left accent */}
            <div className="md:w-1 bg-gradient-to-b from-orange-400 to-rose-500 shrink-0" />

            <div className="p-8 md:p-10 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">TheSocialFox Integration</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                FlowPilot powers the AI backbone for <span className="font-semibold text-gray-900">TheSocialFox</span>,
                a social-media management platform. Content classification, sentiment analysis, and
                automated response workflows run through the same graded-confidence pipeline &mdash;
                proving FlowPilot works beyond isolated demos and handles real-world, multi-tenant
                production traffic.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  Content Classification
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Sentiment Analysis
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Automated Responses
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="max-w-5xl mx-auto px-6 py-10 text-center">
        <p className="text-xs text-gray-400">
          FlowPilot &middot; A FlowCore Engine Project &middot; Portfolio Demo
        </p>
      </footer>
    </div>
  );
}
