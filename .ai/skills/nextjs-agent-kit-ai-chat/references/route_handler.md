# Streaming route handler

## Controller

```ts
// controllers/chat.controller.ts
import { NextResponse, type NextRequest } from 'next/server';
import { runChat, type ToolDef } from '@/lib/server/ai-chat/chat-runner';
import { UserController } from './user.controller';

const TOOLS: ToolDef[] = [
  // register tools here
];

export class ChatController {
  static handleChatRequest = async (req: NextRequest, auth: { userId: string; email: string }): Promise<NextResponse> => {
    const body = await req.json();
    const { messages } = body;

    const user = await UserController.getById(auth.userId, ['password', 'refresh_tokens']);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runChat(user, messages, TOOLS)) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Chat error';
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message }) + '\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  };
}
```

## Route

```ts
// app/api/chat/route.ts
import { ChatController } from '@/controllers/chat.controller';
import { withAuth } from '@/middlewares/auth-wrapper';
import { withDB } from '@/middlewares/db-wrapper';
import { type NextRequest } from 'next/server';

export const POST = withDB(withAuth(async (req: NextRequest, { auth }) => {
  return ChatController.handleChatRequest(req, auth);
}));
```

`/api/chat` is a protected route (not in `PUBLIC_API_PREFIXES`). The proxy verifies the JWT and forwards `x-user-id`.

## Why newline-delimited JSON, not SSE `data:` frames

SSE spec requires `data:` prefixes and double-newline separators. In practice, Next.js Route Handlers returning a `ReadableStream` with `text/event-stream` work fine with raw newline-delimited JSON, and the client parsing is simpler (`split('\n')` + `JSON.parse`). The kit uses this format. If your LLM provider or client library expects strict SSE, add the `data: ` prefix in the encoder.