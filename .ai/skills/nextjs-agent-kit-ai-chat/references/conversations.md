# Conversation persistence

## Store

```ts
// lib/server/stores/conversation-store.ts
import 'server-only';
import { ConversationSchema } from '@/schemas/conversation.schema';
import type { Conversation, ConversationSummary } from '@/model/conversation';

export class ConversationStore {
  constructor(private userId: string) {}

  async list(): Promise<ConversationSummary[]> {
    const docs = await ConversationSchema.find({ user_id: this.userId })
      .sort({ updated_at: -1 })
      .select('-messages')
      .lean();
    return docs.map((d) => ({ _id: d._id!.toString(), title: d.title, created_at: d.created_at?.toISOString(), updated_at: d.updated_at?.toISOString() }));
  }

  async get(id: string): Promise<Conversation | null> {
    const doc = await ConversationSchema.findOne({ _id: id, user_id: this.userId }).lean();
    return doc ?? null;
  }

  async create(title: string, messages: Conversation['messages']): Promise<string> {
    const doc = await ConversationSchema.create({ user_id: this.userId, title, messages });
    return doc._id.toString();
  }

  async appendMessage(id: string, message: Conversation['messages'][number]): Promise<void> {
    await ConversationSchema.updateOne({ _id: id, user_id: this.userId }, { $push: { messages: message } });
  }

  async delete(id: string): Promise<void> {
    await ConversationSchema.deleteOne({ _id: id, user_id: this.userId });
  }
}
```

## Controllers and routes

```ts
// controllers/conversations.controller.ts
import { NextResponse, type NextRequest } from 'next/server';
import { ConversationStore } from '@/lib/server/stores/conversation-store';

export class ConversationsController {
  static handleList = async (auth: { userId: string }) => {
    const store = new ConversationStore(auth.userId);
    const conversations = await store.list();
    return NextResponse.json({ conversations });
  };

  static handleGet = async (auth: { userId: string }, id: string) => {
    const store = new ConversationStore(auth.userId);
    const conv = await store.get(id);
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(conv);
  };

  static handleDelete = async (auth: { userId: string }, id: string) => {
    const store = new ConversationStore(auth.userId);
    await store.delete(id);
    return NextResponse.json({ ok: true });
  };
}
```

```ts
// app/api/conversations/route.ts
export const GET = withDB(withAuth(async (_req, { auth }) => ConversationsController.handleList(auth)));

// app/api/conversations/[id]/route.ts
export const GET = withDB(withAuth(async (_req, { params, auth }) => {
  const { id } = await params;
  return ConversationsController.handleGet(auth, id);
}));

export const DELETE = withDB(withAuth(async (_req, { params, auth }) => {
  const { id } = await params;
  return ConversationsController.handleDelete(auth, id);
}));
```

## React Query hooks

```ts
// hooks/use-conversations.hook.ts
import { ConversationsApi } from '@/api/conversations-api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/client/react-query';

export const conversationsQueryKey = 'conversations';
export const conversationQueryKey = 'conversation';

export const useConversations = () => {
  const { data, isLoading } = useQuery({
    queryKey: [conversationsQueryKey],
    queryFn: () => ConversationsApi.list(),
  });
  return { conversations: data ?? [], isLoading };
};

export const useConversation = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [conversationQueryKey, id],
    queryFn: () => ConversationsApi.get(id),
    enabled: !!id,
  });
  return { conversation: data ?? null, isLoading };
};

export const useDeleteConversation = () => {
  return useMutation({
    mutationFn: (id: string) => ConversationsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [conversationsQueryKey] });
      queryClient.invalidateQueries({ queryKey: [conversationQueryKey, id], exact: true });
    },
  });
};
```

## When to persist

- If the app needs conversation history across sessions, persist each completed turn (user + assistant message pair) after the stream finishes.
- For ephemeral chat (no history), skip persistence entirely. The chat component holds messages in local state.
- The `done` event can include `conversation_id` when the server persisted the conversation. The client uses it to update the history list.