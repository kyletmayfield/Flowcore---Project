/**
 * Frontend client for calling the Claude API via the Vercel serverless proxy.
 * The actual API key is stored server-side — the browser never sees it.
 */

export class ClaudeAPIError extends Error {
  public useMock: boolean;

  constructor(message: string, useMock = false) {
    super(message);
    this.name = "ClaudeAPIError";
    this.useMock = useMock;
  }
}

/**
 * Calls the Claude API through the /api/ai proxy endpoint.
 * Returns the raw text response from Claude.
 */
export async function callClaude(
  prompt: string,
  maxTokens = 4096
): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ClaudeAPIError(
      data.error ?? `API call failed (${response.status})`,
      data.useMock === true
    );
  }

  return data.text;
}
