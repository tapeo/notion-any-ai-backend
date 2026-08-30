# Model conventions and MongoDB layer

## Model conventions

### Backend interface and DTO

Each entity has a backend interface (Mongoose-typed, ObjectId for references) and a DTO interface (JSON-safe, string for IDs, ISO strings for dates).

```ts
// model/wiki-document.ts
import { Types } from 'mongoose';

export interface WikiDocument {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  parent_id?: Types.ObjectId | null;
  title: string;
  slug: string;
  content: string;
  order: number;
  deleted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  embedding?: number[] | null;
  embedding_model?: string | null;
  embedded_at?: Date | null;
  share?: {
    token: string | null;
    enabled: boolean;
    updated_at: Date | null;
  };
}

export interface WikiDocumentDto {
  _id?: string;
  user_id: string;
  parent_id?: string | null;
  title: string;
  slug: string;
  content: string;
  order: number;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  share?: {
    token: string | null;
    enabled: boolean;
    updated_at: string | null;
  };
}

export interface WikiDocumentSummary {
  _id: string;
  title: string;
  slug: string;
  parent_id?: string | null;
  deleted_at?: string | null;
  updated_at?: string;
  excerpt?: string;
}
```

### Rules

- **Backend interface** uses `Types.ObjectId` for references, `Date` for dates, `_id?: Types.ObjectId`.
- **DTO** uses `string` for IDs and references, `string` for dates (ISO 8601), `_id?: string`.
- **Summary** is a lighter DTO for list views, with only the fields the list needs.
- **Field names are snake_case** in both interfaces, matching the Mongoose schema. Do not introduce a camelCase layer. Mongoose `.lean()` returns snake_case, and the API returns it as-is.
- Convert ObjectId to string at the controller boundary: `_id: doc._id.toString()`.
- Convert Date to ISO string when building DTOs: `doc.created_at?.toISOString()`.

### Conversion helper

When a `.lean()` query returns the backend shape, convert to DTO in the store or controller:

```ts
function toDto(doc: WikiDocument): WikiDocumentDto {
  return {
    _id: doc._id?.toString(),
    user_id: doc.user_id.toString(),
    parent_id: doc.parent_id?.toString() ?? null,
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    order: doc.order,
    deleted_at: doc.deleted_at?.toISOString() ?? null,
    created_at: doc.created_at?.toISOString(),
    updated_at: doc.updated_at?.toISOString(),
    share: doc.share ? {
      token: doc.share.token,
      enabled: doc.share.enabled,
      updated_at: doc.share.updated_at?.toISOString() ?? null,
    } : undefined,
  };
}
```

For summary projections, select only the needed fields and map:

```ts
async getDocumentTree(): Promise<WikiDocumentSummary[]> {
  const docs = await WikiDocumentSchema.find(liveFilter(this.userId))
    .sort({ order: 1, title: 1 })
    .select('-content')
    .lean();
  return docs.map(toSummary);
}
```

### Enums

Use TypeScript unions or Mongoose enum fields for status/type:

```ts
export enum OtpPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR = 'two_factor',
}

const otpSchema = new Schema<IOtp>({
  purpose: {
    type: String,
    enum: Object.values(OtpPurpose),
    required: true,
  },
  // ...
});
```

---

## Schemas

### Mongoose schema file

```ts
// schemas/wiki-document.schema.ts
import { WikiDocument } from '@/model/wiki-document';
import { Model, Schema, model, models } from 'mongoose';

const wikiDocumentSchema = new Schema<WikiDocument>({
  user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  parent_id: { type: Schema.Types.ObjectId, required: false, default: null, index: true, ref: 'WikiDocument' },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  content: { type: String, default: '' },
  order: { type: Number, default: 0 },
  deleted_at: { type: Date, required: false, default: null, index: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  embedding: { type: [Number], default: null },
  embedding_model: { type: String, default: null },
  embedded_at: { type: Date, default: null },
  share: {
    token: { type: String, default: null, index: { sparse: true } },
    enabled: { type: Boolean, default: false },
    updated_at: { type: Date, default: null },
  },
});

wikiDocumentSchema.index({ user_id: 1, slug: 1 }, { unique: true });
wikiDocumentSchema.index({ user_id: 1, title: 'text', content: 'text' });

export const WikiDocumentSchema =
  (models.WikiDocument as Model<WikiDocument>) || model<WikiDocument>('WikiDocument', wikiDocumentSchema);
```

### Rules

- One schema file per entity in `schemas/`.
- Field names: snake_case.
- `timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }` when using Mongoose timestamps.
- Indexes declared on the schema, compound indexes via `schema.index(...)`.
- Model registration: `(models.X as Model<T>) || model<T>('X', schema)` to avoid overwrite on hot reload.
- Sub-documents: define inline or as a separate `Schema<T>` with `_id: false` when no separate ID is needed.

### Extending a base schema

When an app-specific schema extends a shared base (e.g. a base user schema plus app-specific fields):

```ts
// schemas/user.schema.ts
import { User } from '@/model/user';
import { baseUserSchemaDefinition } from '@/schemas/base-user.schema';
import { Model, Schema, model, models } from 'mongoose';

const userSchema = new Schema<User>().add(baseUserSchemaDefinition);
userSchema.remove('llm_settings');
userSchema.add({ llm_settings: { type: LlmSettingsSchema, default: null } });
userSchema.add({
  preferences: { type: PreferencesSchema, default: {} },
});

const UserSchema = (models.User as Model<User>) || model<User>('User', userSchema);
export default UserSchema;
```

---

## Connection

### Cached singleton for serverless

```ts
// lib/server/mongodb.ts
import 'server-only';
import mongoose, { type Mongoose } from 'mongoose';

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const g = globalThis as { mongooseCache?: MongooseCache };
const cached: MongooseCache = g.mongooseCache ?? (g.mongooseCache = { conn: null, promise: null });

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }
  cached.promise = mongoose.connect(Config.mongo.uri, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
```

Use `globalThis` to cache across hot reloads in development and across serverless invocations. Never create a module-level `let db = ...` or `late` connection. The `withDB` wrapper calls `connectDB()` at the start of every route handler.

---

## Server stores

For per-user data access, use a store class that takes `userId` via constructor. This scopes all queries to the authenticated user.

```ts
// lib/server/stores/wiki-store.ts
import 'server-only';
import { WikiDocumentSchema } from '@/schemas/wiki-document.schema';

function liveFilter(userId: string): Record<string, unknown> {
  return { user_id: userId, deleted_at: null };
}

export class WikiStore {
  constructor(private userId: string) {}

  async listRoots(): Promise<WikiDocumentSummary[]> {
    const docs = await WikiDocumentSchema.find({
      ...liveFilter(this.userId),
      parent_id: null,
    }).sort({ order: 1, title: 1 }).lean();
    return docs.map(toSummary);
  }

  async getDocument(id: string): Promise<WikiDocumentDto | null> {
    const doc = await WikiDocumentSchema.findOne({
      _id: id,
      ...liveFilter(this.userId),
    }).lean();
    return doc ? toDto(doc) : null;
  }
}
```

The route handler creates a store instance with the authenticated user ID:

```ts
export const GET = withDB(withAuth(async (_req, { auth }) => {
  const store = new WikiStore(auth.userId);
  const roots = await store.listRoots();
  return NextResponse.json({ roots });
}));
```

---

## Dates

Use Luxon. Default zone `Europe/Rome`.

```ts
import { DateTime } from 'luxon';

// Parse
const dt = DateTime.fromISO(isoString);

// Now
const now = DateTime.now();

// Format for display
const formatted = dt.setZone('Europe/Rome').toFormat('d MMMM yyyy');

// Add duration
const expires = DateTime.now().plus({ hours: 1 }).toISO();

// Store as UTC ISO string
const stored = DateTime.now().toUTC().toISO();
```

Never use the native `Date` for storage. Store ISO 8601 strings. Parse with `DateTime.fromISO()`. For display, set the user's timezone (stored in preferences) and format.

```ts
// lib/shared/format-date.ts
import { DateTime } from 'luxon';

export function formatLong(iso: string | null | undefined, timezone: string | null): string {
  if (!iso) return '';
  const dt = DateTime.fromISO(iso);
  if (timezone) return dt.setZone(timezone).toFormat('d MMMM yyyy');
  return dt.toUTC().toFormat('d MMMM yyyy');
}
```

---

## Soft delete

Use a `deleted_at` field for soft delete. Filter with a `liveFilter` helper:

```ts
function liveFilter(userId: string): Record<string, unknown> {
  return { user_id: userId, deleted_at: null };
}
```

List endpoints filter to live docs. A dedicated trash endpoint queries `deleted_at: { $ne: null }`. Restore sets `deleted_at: null`. Purge does a hard `findByIdAndDelete`.

The client handles the tombstone UI: when a `GET /documents/:id` returns a doc with `deleted_at`, render a restore banner instead of the editor.