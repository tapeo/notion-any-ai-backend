# Client streaming reader

## ChatApi.streamChat

An async generator that reads the stream line by line and yields each parsed event.

```ts
// api/chat-api.ts
import { client } from '@/lib/client/client';
import type { AiStreamEvent } from '@/lib/server/ai-chat/stream-events';

export interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  conversationId?: string;
}

export class ChatApi {
  static async *streamChat(body: ChatRequestBody): AsyncGenerator<string> {
    const response = await fetch(`${client.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '');
      throw new Error(`Chat request failed: ${response.status} ${text}`);
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
        if (trimmed) yield trimmed;
      }
    }
    if (buffer.trim()) yield buffer.trim();
  }
}
```

## Component usage

```tsx
const send = async (text: string) => {
  const nextMessages = [...messages, { role: 'user', content: text }];
  setMessages([...nextMessages, { role: 'assistant', content: '' }]);
  setIsStreaming(true);

  try {
    for await (const chunk of ChatApi.streamChat({ messages: nextMessages })) {
      const event = JSON.parse(chunk) as AiStreamEvent;
      if (event.type === 'text') {
        // append to the last assistant message
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + event.text };
          return copy;
        });
      }
      if (event.type === 'done') {
        // optionally persist the conversation
      }
      if (event.type === 'error') {
        await Dialog.alert({ title: 'Chat error', description: event.message });
      }
    }
  } finally {
    setIsStreaming(false);
  }
};
```

## Why `fetch` directly, not `client.fetch`

`client.fetch` reads the full response body for error handling. For streaming, we need the raw `ReadableStream` immediately, before consuming the body. So the chat stream uses `fetch` directly. The 401 refresh is handled by the browser cookie: if the access token expired, the cookie is still sent, the proxy returns `token_expired`, and the response will not be `ok`. The component shows the error.

For a more robust flow, catch the 401 in the stream reader, call `/auth/refresh` once, and retry the stream. The kit keeps it simple: if the stream fails with 401, the global `client` reauth dialog (triggered by a subsequent non-streaming request) will prompt login. Alternatively, check `response.status === 401` before reading the stream and call `refreshAccessToken` then retry.