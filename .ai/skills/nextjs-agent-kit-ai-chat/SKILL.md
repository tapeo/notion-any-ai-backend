---
name: nextjs-agent-kit-ai-chat
description: >-
  Add an AI chat feature to a Next.js app built on the Next.js Agent Kit. Use
  when implementing AI chat against an OpenAI-compatible endpoint, SSE
  streaming, tool calling, conversation persistence, message history, or
  per-user LLM provider configuration. Covers the server-side chat runner,
  the streaming route handler, the client streaming reader, conversation
  store, and React Query hooks for conversation history.
---

# How to add AI chat

Chat is **opt-in**. Build it when your app needs a conversational AI interface against an OpenAI-compatible endpoint (OpenAI, Gemini via its OpenAI-compatible endpoint, OpenRouter, a self-hosted LLM, etc.).

## What you need to build

```
model/
  conversation.ts             # Conversation + Message interfaces
schemas/
  conversation.schema.ts      # Mongoose schemas
lib/server/
  ai-chat/
    chat-runner.ts            # Orchestrates the LLM call, streaming, tool calls
    stream-events.ts          # AiStreamEvent union type
  llm-client.ts               # Thin wrapper over the OpenAI-compatible endpoint
  config.ts                   # Config.openrouter, Config.gemini, etc.
controllers/
  chat.controller.ts          # POST /api/chat handler, reads body, runs chat-runner
  conversations.controller.ts # GET/DELETE conversations
api/
  chat-api.ts                 # ChatApi.streamChat (async generator), ConversationsApi
hooks/
  use-conversations.hook.ts   # useConversations, useConversation, useDeleteConversation
components/
  chat/
    ai-chat.tsx               # Main chat component, manages streaming state
    message-list.tsx
    message-bubble.tsx
    chat-input.tsx
    empty-state.tsx
    past-conversations.tsx
app/api/
  chat/route.ts               # POST, text/event-stream
  conversations/route.ts      # GET, list
  conversations/[id]/route.ts # GET single, DELETE
app/app/page.tsx              # Chat page (or overlay)
```

## Steps

| step | reference | what |
| ---- | --------- | ---- |
| 0 | `references/models_and_schemas.md` | Conversation, Message, AiStreamEvent types, Mongoose schemas |
| 1 | `references/llm_client.md` | LLM client wrapper, OpenAI-compatible request, streaming |
| 2 | `references/chat_runner.md` | chat-runner: build messages, call LLM, parse stream, dispatch events, handle tool calls |
| 3 | `references/route_handler.md` | POST /api/chat streaming route, controller, SSE encoding |
| 4 | `references/client.md` | ChatApi.streamChat async generator, reading the stream in the component |
| 5 | `references/conversations.md` | Conversation store, list/get/delete controllers, React Query hooks |
| 6 | (below) | Build the chat component |

## Step 6: Build the chat component

The chat component manages local state for the streaming message, sends user input to the API, and appends completed messages to the conversation.

```tsx
// components/chat/ai-chat.tsx
'use client';

import { useState } from 'react';
import { ChatApi } from '@/api/chat-api';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { EmptyState } from './empty-state';
import type { Message } from '@/model/conversation';

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const send = async (text: string) => {
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setIsStreaming(true);

    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantMessage]);

    try {
      for await (const chunk of ChatApi.streamChat({ messages: nextMessages })) {
        const event = JSON.parse(chunk);
        if (event.type === 'text') {
          assistantMessage.content += event.text;
          setMessages([...nextMessages, { ...assistantMessage }]);
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  if (messages.length === 0) return <EmptyState onSuggest={send} />;
  return (
    <>
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={isStreaming} />
    </>
  );
}
```

## Streaming format

The server returns `text/event-stream` with newline-delimited JSON (one JSON object per line, no `data:` prefix). The client reads with a `ReadableStream` reader and `JSON.parse` each line into an `AiStreamEvent`.

```ts
export type AiStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'done'; conversation_id?: string }
  | { type: 'error'; message: string };
```

## Rules

- The LLM endpoint is OpenAI-compatible (`/v1/chat/completions` with `stream: true`). Gemini is accessed through its OpenAI-compatible endpoint so the same pipeline works.
- Per-user provider config (API key, endpoint, model) is stored on the user record (`llm_settings`). The chat-runner reads it from the authenticated user, not from a global server env, when the user has a custom config. Fall back to the server default (`Config.openrouter.api_key`) when the user has none.
- Conversation persistence is optional. For a simple chat, stream without saving. For history, persist messages to a `Conversation` collection keyed by `user_id`.
- Tool calling: the chat-runner intercepts `tool_call` events, executes the tool server-side, appends the result, and re-calls the LLM. The client sees `tool_call` and `tool_result` events for display.
- Never stream the user's API key to the client. The server reads it from the user record and adds it to the LLM request server-side.

## Checklist

- [ ] `model/conversation.ts` + `schemas/conversation.schema.ts` created (if persisting)
- [ ] `lib/server/ai-chat/stream-events.ts` with `AiStreamEvent` union
- [ ] `lib/server/llm-client.ts` wrapping the OpenAI-compatible endpoint
- [ ] `lib/server/ai-chat/chat-runner.ts` orchestrating the call
- [ ] `controllers/chat.controller.ts` + `app/api/chat/route.ts` streaming
- [ ] `api/chat-api.ts` with `streamChat` async generator
- [ ] `components/chat/*` UI components
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created