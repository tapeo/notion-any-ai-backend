# LLM client

A thin wrapper over the OpenAI-compatible `/v1/chat/completions` endpoint. Works with OpenAI, OpenRouter, Gemini (via its OpenAI-compatible endpoint), and self-hosted LLMs.

```ts
// lib/server/llm-client.ts
import 'server-only';

export interface LlmRequest {
  endpoint: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  tools?: Array<{ type: 'function'; function: { name: string; description?: string; parameters: object } }>;
  temperature?: number;
  max_tokens?: number;
}

export interface LlmStreamChunk {
  delta?: { content?: string; tool_calls?: Array<{ index: number; id?: string; function: { name?: string; arguments?: string } }> };
  finish_reason?: string | null;
}

export async function* streamLlmCompletion(req: LlmRequest): AsyncGenerator<LlmStreamChunk> {
  const response = await fetch(`${req.endpoint.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      tools: req.tools,
      temperature: req.temperature,
      max_tokens: req.max_tokens,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`LLM error ${response.status}: ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        yield JSON.parse(data) as LlmStreamChunk;
      } catch { /* skip malformed */ }
    }
  }
}
```

## Per-user config resolution

```ts
export function resolveLlmConfig(user: { llm_settings?: LlmSettings }): { endpoint: string; apiKey: string; model: string } {
  if (user.llm_settings?.use_custom_endpoint) {
    return {
      endpoint: user.llm_settings.custom_endpoint ?? '',
      apiKey: user.llm_settings.custom_api_key ?? '',
      model: user.llm_settings.custom_model ?? '',
    };
  }
  return {
    endpoint: Config.openrouter.endpoint ?? 'https://openrouter.ai/api/v1',
    apiKey: Config.openrouter.api_key,
    model: Config.openrouter.default_model ?? 'openai/gpt-4o-mini',
  };
}
```

The user's API key never leaves the server. The chat-runner reads `user.llm_settings` server-side and builds the `LlmRequest`. The client only sends the conversation messages.