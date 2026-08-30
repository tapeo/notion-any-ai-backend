# Conversation models and schemas

## Conversation

```ts
// model/conversation.ts
import { Types } from 'mongoose';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
  created_at?: Date;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface Conversation {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  title: string;
  messages: Message[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
}
```

## Schema

```ts
// schemas/conversation.schema.ts
import { Conversation } from '@/model/conversation';
import { Model, Schema, model, models } from 'mongoose';

const messageSchema = new Schema<Conversation['messages'][number]>({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system', 'tool'] },
  content: { type: String, default: '' },
  tool_calls: [{ type: Schema.Types.Mixed }],
  tool_call_id: { type: String },
  name: { type: String },
  created_at: { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new Schema<Conversation>({
  user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  title: { type: String, default: 'New conversation' },
  messages: [messageSchema],
}, {
  collection: 'conversations',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const ConversationSchema =
  (models.Conversation as Model<Conversation>) || model<Conversation>('Conversation', conversationSchema);
```

## AiStreamEvent

```ts
// lib/server/ai-chat/stream-events.ts
export type AiStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; name: string; result: unknown }
  | { type: 'done'; conversation_id?: string }
  | { type: 'error'; message: string };
```

The server serializes each event as a JSON line. The client parses with `JSON.parse`. No `data:` prefix, no SSE `event:` fields. Just newline-delimited JSON over a `text/event-stream` response.