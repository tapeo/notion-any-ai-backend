---
name: nextjs-agent-kit-settings
description: >-
  Add a settings screen to a Next.js app built on the Next.js Agent Kit. Use
  when implementing user settings, LLM provider configuration, timezone
  auto-detect, clear app data, about dialog, legal links, feedback modal,
  or account management (delete account, logout). Covers the settings
  route, per-user preferences model, LLM settings sub-schema, and the
  clear-app-data flow that invalidates React Query caches.
---

# How to add settings

Settings are **opt-in**. Build them when your app needs a settings screen with user preferences, provider config, or account management.

## What you need to build

```
model/preferences.ts            # Preferences interface (timezone, theme, etc.)
model/llm-settings.ts           # LlmSettings interface (per-user AI provider config)
schemas/preferences.schema.ts   # Mongoose sub-schema
schemas/llm-settings.schema.ts  # Mongoose sub-schema
model/user.ts                   # add preferences and llm_settings fields
app/api/preferences/route.ts    # GET, PUT (auth-gated)
app/api/settings/route.ts       # PUT llm_settings (auth-gated)
hooks/preferences.hook.ts       # usePreferences, useUpdatePreferences
hooks/settings.hook.ts          # useUpdateLlmSettings
components/
  settings/
    llm-provider-setup.tsx
    timezone-setup.tsx
  feedback-modal.tsx
app/app/settings/page.tsx       # Settings screen
```

## Preferences

```ts
// model/preferences.ts
export interface Preferences {
  timezone?: string | null;
  theme?: 'light' | 'dark' | 'system' | null;
  // add app-specific preferences here
}
```

```ts
// schemas/preferences.schema.ts
const PreferencesSchema = new Schema<Preferences>({
  timezone: { type: String, default: null },
  theme: { type: String, default: null },
}, { _id: false });
```

Add `preferences: { type: PreferencesSchema, default: {} }` to the user schema.

## LLM settings

```ts
// model/llm-settings.ts
export interface LlmSettings {
  use_custom_endpoint: boolean;
  custom_endpoint?: string;
  custom_api_key?: string;
  custom_model?: string;
}
```

The chat-runner (see the ai-chat skill) reads `user.llm_settings` to decide whether to use the user's custom endpoint or the server default.

## Timezone auto-detect

```ts
// hooks/preferences.hook.ts
import { PreferencesApi } from '@/api/preferences-api';
import { useUser } from '@/hooks/user.hook';
import { useEffect } from 'react';

export function useAutoDetectTimezone() {
  const { user } = useUser();
  useEffect(() => {
    if (user?.preferences?.timezone) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) PreferencesApi.update({ timezone: tz });
  }, [user?.preferences?.timezone]);
}
```

Call `useAutoDetectTimezone()` in the app shell. It runs once, detects the browser timezone, and saves it if the user has none.

## Preferences hooks

```ts
export const usePreferences = () => {
  const { user } = useUser();
  return { preferences: user?.preferences ?? null };
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Preferences>) => PreferencesApi.update(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userQueryKey] });
    },
  });
};
```

Updating preferences invalidates the `user-me` query so `useUser` refetches with the new preferences.

## Clear app data

For apps with local state (React Query cache, localStorage, jotai atoms), a "clear app data" action resets everything:

```ts
const clearAppData = async () => {
  const confirmed = await Dialog.confirm({
    title: 'Clear app data',
    description: 'This will reset your local data. This action cannot be undone.',
    destructive: true,
    confirmText: 'Clear',
  });
  if (!confirmed) return;

  // Clear server-side preferences (optional)
  await PreferencesApi.update({ /* reset fields */ });

  // Clear React Query cache
  queryClient.clear();

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Reset jotai atoms (if any)
  // useSetAtom(resetAllAtom) or reset each atom

  // Reload to re-mount the app
  window.location.reload();
};
```

## Settings screen

```tsx
// app/app/settings/page.tsx
'use client';

import { LlmProviderSetup } from '@/components/settings/llm-provider-setup';
import { TimezoneSetup } from '@/components/settings/timezone-setup';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth.hook';

export default function SettingsPage() {
  const { logout, deleteAccount } = useAuth();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Settings</h1>
      <TimezoneSetup />
      <LlmProviderSetup />
      <section className="space-y-2">
        <h2 className="text-lg">Account</h2>
        <Button variant="outline" onClick={logout}>Log out</Button>
        <Button variant="destructive" onClick={deleteAccount}>Delete account</Button>
      </section>
    </div>
  );
}
```

## Feedback modal

A dialog triggered from the navbar "Send feedback" button. POSTs to `/api/contact` (a public route) with the user's email and message.

```tsx
export function FeedbackModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  // shadcn Dialog with a textarea, POST to /api/contact on submit
}
```

## Rules

- Preferences and LLM settings are stored on the user record, not in a separate collection. They are small and always read with the user.
- `usePreferences` reads from `useUser`, no separate query. Updates invalidate `user-me`.
- Timezone auto-detect runs once in the app shell. Do not re-detect on every render.
- Clear app data clears the React Query cache, localStorage, sessionStorage, jotai atoms, then reloads. The reload re-mounts the app with a clean state.
- The delete-account flow uses `Dialog.confirm` (destructive) before calling `UserApi.deleteAccount` + `logout`.

## Checklist

- [ ] `model/preferences.ts` + `schemas/preferences.schema.ts` created
- [ ] User model and schema extended with `preferences` and `llm_settings`
- [ ] `app/api/preferences/route.ts` + `app/api/settings/route.ts` created (auth-gated)
- [ ] `hooks/preferences.hook.ts` + `hooks/settings.hook.ts` created
- [ ] `app/app/settings/page.tsx` created
- [ ] `useAutoDetectTimezone` called in the app shell
- [ ] Feedback modal created (optional)
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created