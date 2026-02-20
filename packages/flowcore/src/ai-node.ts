import type {
  NodeConfig,
  TraceDepth,
  ReasoningTrace,
} from "./types.js";

/**
 * Result returned by an AI node execution.
 */
export interface AINodeResult {
  decision: string;
  confidence: number;
  reasoning?: ReasoningTrace;
}

/**
 * Builds the prompt for an AI node based on the brief's prompt architecture.
 */
export function buildAINodePrompt(
  config: NodeConfig,
  inputPayload: Record<string, unknown>,
  traceDepth: TraceDepth
): string {
  const instruction = config.instruction ?? "Analyze the input and decide.";
  const outputCategories = config.output_schema ?? [];

  let responseFormat: string;

  if (traceDepth === "full") {
    responseFormat = `{
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
}`;
  } else if (traceDepth === "summary") {
    responseFormat = `{
    "decision": "<one of the expected output categories>",
    "confidence": <number between 0.00 and 1.00>,
    "reasoning": {
        "summary": "<1-2 sentence explanation>",
        "factors": [<top 2 factors only>]
    }
}`;
  } else {
    responseFormat = `{
    "decision": "<one of the expected output categories>",
    "confidence": <number between 0.00 and 1.00>
}`;
  }

  return `You are an AI decision node in an automated workflow. Your job is to analyze the provided input and make the best possible decision.

INSTRUCTION FROM WORKFLOW DESIGNER:
${instruction}

EXPECTED OUTPUT CATEGORIES:
${JSON.stringify(outputCategories)}

INPUT DATA:
${JSON.stringify(inputPayload, null, 2)}

TRACE DEPTH: ${traceDepth}

You MUST respond in valid JSON and nothing else.

${responseFormat}

RULES:
- Your decision MUST be one of the expected output categories. Never invent new ones.
- Your confidence MUST reflect genuine uncertainty. Do not default to high confidence.
- You MUST always pick the best option, even if uncertain. Never refuse to decide.
- When trace is full, you MUST consider at least one alternative and explain why you rejected it.
- Reference specific content from the input in your observations.
- A confidence of 0.59 or below means you are essentially guessing. Be honest about this.`;
}

/**
 * Parses the raw AI response JSON into a typed AINodeResult.
 * Validates required fields and normalizes the structure.
 */
export function parseAIResponse(
  raw: string,
  traceDepth: TraceDepth
): AINodeResult {
  const parsed = JSON.parse(raw);

  if (typeof parsed.decision !== "string") {
    throw new Error("AI response missing 'decision' field");
  }
  if (typeof parsed.confidence !== "number") {
    throw new Error("AI response missing 'confidence' field");
  }

  const result: AINodeResult = {
    decision: parsed.decision,
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
  };

  if (traceDepth !== "off" && parsed.reasoning) {
    result.reasoning = {
      summary: parsed.reasoning.summary ?? "",
      factors: parsed.reasoning.factors ?? [],
      alternatives_considered:
        parsed.reasoning.alternatives_considered ?? [],
    };
  }

  return result;
}
