# Chat runner

The chat-runner orchestrates the LLM call, parses the stream, dispatches `AiStreamEvent`s, and handles tool calls by executing them server-side and re-calling the LLM.

```ts
// lib/server/ai-chat/chat-runner.ts
import 'server-only';
import { streamLlmCompletion, resolveLlmConfig, type LlmRequest } from '../llm-client';
import type { AiStreamEvent } from './stream-events';
import type { Message } from '@/model/conversation';

export interface ToolDef {
  name: string;
  description: string;
  parameters: object;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export async function* runChat(
  user: { llm_settings?: LlmSettings },
  messages: Message[],
  tools: ToolDef[] = [],
): AsyncGenerator<AiStreamEvent> {
  const config = resolveLlmConfig(user);
  const toolSchemas = tools.map((t) => ({ type: 'function' as const, function: { name: t.name, description: t.description, parameters: t.parameters } }));

  let currentMessages = [...messages];

  for (let turn = 0; turn < 5; turn++) {
    const request: LlmRequest = {
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      model: config.model,
      messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
      tools: toolSchemas.length > 0 ? toolSchemas : undefined,
    };

    let assistantContent = '';
    let pendingToolCalls: Array<{ id: string; name: string; args: string }> = [];
    let finishReason: string | null = null;

    for await (const chunk of streamLlmCompletion(request)) {
      if (chunk.delta?.content) {
        assistantContent += chunk.delta.content;
        yield { type: 'text', text: chunk.delta.content };
      }
      if (chunk.delta?.tool_calls) {
        for (const tc of chunk.delta.tool_calls) {
          const existing = pendingToolCalls[tc.index];
          if (!existing) {
            pendingToolCalls[tc.index] = { id: tc.id ?? '', name: tc.function?.name ?? '', args: tc.function?.arguments ?? '' };
          } else {
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name += tc.function.name;
            if (tc.function?.arguments) existing.args += tc.function.arguments;
          }
        }
      }
      if (chunk.finish_reason) finishReason = chunk.finish_reason;
    }

    currentMessages = [...currentMessages, { role: 'assistant', content: assistantContent, tool_calls: pendingToolCalls.length > 0 ? pendingToolCalls.map((t) => ({ id: t.id, type: 'function' as const, function: { name: t.name, arguments: t.args } })) : undefined }];

    if (finishReason !== 'tool_calls' || pendingToolCalls.length === 0) {
      yield { type: 'done' };
      return;
    }

    for (const call of pendingToolCalls) {
      const args = JSON.parse(call.args || '{}');
      yield { type: 'tool_call', name: call.name, args };
      const tool = tools.find((t) => t.name === call.name);
      let result: unknown;
      if (tool) {
        try {
          result = await tool.execute(args);
        } catch (error) {
          result = { error: error instanceof Error ? error.message : 'Tool execution failed' };
        }
      } else {
        result = { error: `Unknown tool: ${call.name}` };
      }
      yield { type: 'tool_result', name: call.name, result };
      currentMessages = [...currentMessages, { role: 'tool', content: JSON.stringify(result), tool_call_id: call.id, name: call.name }];
    }
  }

  yield { type: 'error', message: 'Max tool-call turns reached' };
}
```

## Rules

- Max 5 tool-call turns per request. Prevents infinite loops when a tool keeps calling itself.
- Tool calls are executed server-side. The client only sees `tool_call` and `tool_result` events for display.
- The assistant message with `tool_calls` is appended to `currentMessages` so the next LLM call has the full context.
- Tool results are appended as `role: 'tool'` messages with `tool_call_id`.
- The user's API key is read from `user.llm_settings` server-side. Never sent to the client.