# Naming conventions and imports

## Naming conventions

### Files

| type                | pattern                          | example                              |
| ------------------- | -------------------------------- | ------------------------------------ |
| Route page          | `page.tsx`                       | `app/wiki/[id]/page.tsx`             |
| Route layout        | `layout.tsx`                     | `app/app/layout.tsx`                 |
| Route handler       | `route.ts`                       | `app/api/wiki/route.ts`              |
| Loading state       | `loading.tsx`                    | `app/wiki/loading.tsx`               |
| Error boundary      | `error.tsx`                      | `app/wiki/error.tsx`                 |
| Client API class    | `<resource>-api.ts`              | `wiki-api.ts`                        |
| React Query hook    | `<resource>.hook.ts`             | `wiki.hook.ts`                       |
| UI hook             | `use-<name>.ts`                  | `use-auto-save.ts`                   |
| Model interface     | `<entity>.ts`                    | `wiki-document.ts`, `user.ts`        |
| Mongoose schema     | `<entity>.schema.ts`             | `wiki-document.schema.ts`            |
| Controller          | `<resource>.controller.ts`       | `login.controller.ts`                |
| Server store        | `<resource>-store.ts`            | `wiki-store.ts`                      |
| Server util         | `<name>.ts`                      | `embeddings.ts`, `agent.ts`          |
| Client util         | `<name>.ts`                      | `utils.ts`, `sanitize-html.ts`       |
| Shared util         | `<name>.ts`                      | `format-date.ts`, `wiki-link.ts`     |
| UI component        | `<name>.tsx`                     | `button.tsx`, `dialog.tsx`           |
| Feature component   | `<name>.tsx`                     | `wiki-editor.tsx`, `chat-input.tsx`  |
| Provider            | `<name>-provider.tsx`            | `query-provider.tsx`                 |
| Middleware util     | `<name>.ts`                      | `jwt-auth.ts`, `rate-limiter.ts`     |
| Custom exception    | `<name>.ts`                      | `api-error.ts`                       |

### Classes and identifiers

| type              | pattern                | example                |
| ----------------- | ---------------------- | ---------------------- |
| Controller        | `<Resource>Controller` | `LoginController`      |
| API client        | `<Resource>Api`        | `WikiApi`, `AuthApi`   |
| Server store      | `<Resource>Store`      | `WikiStore`            |
| Service           | `<Provider>Service`    | `EmailService`, `StripeService` |
| Model interface   | `<Entity>`             | `WikiDocument`, `User` |
| DTO interface     | `<Entity>Dto`          | `WikiDocumentDto`      |
| Summary interface | `<Entity>Summary`      | `WikiDocumentSummary`  |
| Hook              | `use<Resource>`        | `useWikiTree`, `useUser` |
| Query key const   | `<resource>QueryKey`   | `wikiTreeQueryKey`     |
| Custom exception  | `<Domain>Error`        | `ApiError`, `OpenRouterError` |
| Config section    | `Config.<section>`     | `Config.jwt`, `Config.mongo` |
| Enum              | `<Domain>`             | `OtpPurpose`, `JwtError` |

### Database fields

snake_case for Mongoose schema fields:

```ts
const userSchema = new Schema<User>({
  email: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
```

### TypeScript fields

camelCase for TS interface fields that map to DB fields via Mongoose:

```ts
// When using .lean() and projecting, Mongoose returns the schema field names (snake_case).
// Backend interfaces keep snake_case to match the DB.
export interface WikiDocument {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  parent_id?: Types.ObjectId | null;
  created_at?: Date;
  updated_at?: Date;
}
```

The kit keeps backend interfaces in snake_case to match Mongoose `.lean()` output. DTOs for the frontend also use snake_case (the API returns them as-is from `.lean()` plus `_id.toString()`). Do not introduce a second camelCase layer.

### JSON keys

snake_case in JSON responses, matching the DB:

```json
{ "_id": "abc", "user_id": "def", "created_at": "2026-07-30T10:00:00.000Z" }
```

### Constants

SCREAMING_SNAKE_CASE for top-level constants:

```ts
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;
const GCM_PREFIX = 'gcm';
```

### Environment variables

UPPER_SNAKE_CASE. `NEXT_PUBLIC_` prefix for client-exposed vars:

```
MONGODB_URI=...
ACCESS_TOKEN_SECRET=...
NEXT_PUBLIC_ALLOW_SIGNUP=true
NEXT_PUBLIC_BACKEND_API_URL=/api
```

---

## Imports

### Ordering

1. Node.js built-ins (`fs`, `path`, `crypto`)
2. Third-party libraries (`next`, `react`, `mongoose`, `luxon`, `lucide-react`)
3. Absolute path aliases (`@/components/...`, `@/lib/...`, `@/model/...`, `@/schemas/...`)
4. Relative imports (`./`, `../`)

Separate each group with a blank line.

```ts
import fs from 'fs';
import path from 'path';

import { NextResponse, type NextRequest } from 'next/server';
import { DateTime } from 'luxon';
import mongoose, { Schema, model, models } from 'mongoose';

import { WikiDocument } from '@/model/wiki-document';
import { WikiDocumentSchema } from '@/schemas/wiki-document.schema';
import { Config } from '@/lib/server/config';

import { slugify } from './wiki-shared';
```

### Path alias

Always use `@/*` absolute imports for intra-project files. Both intra-feature and cross-feature.

- `@/components/ui/button`
- `@/hooks/wiki.hook`
- `@/model/wiki-document`
- `@/schemas/wiki-document.schema`
- `@/lib/client/utils`
- `@/lib/server/stores/wiki-store`

No relative imports (`../`, `../../`) for cross-file references. The only exception is co-located files within the same folder where a relative import is clearer (`./wiki-shared`).

### Selective imports

```ts
import { type NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, model, models, type Model } from 'mongoose';
import { show } from '@/components/ui/sonner' show { toast };
```

### No barrel files

Import files directly. Only create an `index.ts` re-export when a feature has 5+ modules to re-export, and keep it as `export` statements only, no logic.

---

## ESLint

### Configuration

Extend the Next.js presets. Ignore `shared/` if you use a git subtree.

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'shared/**', 'next-env.d.ts']),
  { rules: { 'react/no-unescaped-entities': 'off' } },
]);

export default eslintConfig;
```

### Rules

- **Never use `// eslint-disable-next-line`** or `// eslint-disable` to suppress lint warnings. Fix the underlying issue. See `.ai/shared/code-style.md`.
- **No inline ternary operators**. The kit bans them. Use if/else blocks, or extract to a method. See `.ai/shared/code-style.md`.
- Keep the config minimal. Extend with custom rules only when the team agrees.

### TypeScript

- `strict: true`, never disable.
- `interface` for object shapes, `type` for unions, primitives, mapped types.
- Use type guards when needed.
- Explicit return types on exported functions.
- `noEmit: true`, the kit uses Next.js for builds, `tsc` only for type checking.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"], "@/models/*": ["./model/*"] }
  },
  "exclude": ["node_modules", "shared"]
}
```

---

## File size

Max ~400 lines per file, excluding comments, blank lines, and imports. When approaching the limit:

- Extract utility functions into dedicated files with descriptive names.
- Separate components into their own files.
- Consolidate similar functionality to avoid duplication.
- Use meaningful file names (`user-authentication.ts` instead of `index.ts`).

---
