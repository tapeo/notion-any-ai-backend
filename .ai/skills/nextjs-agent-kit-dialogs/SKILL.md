---
name: nextjs-agent-kit-dialogs
description: >-
  Add imperative dialogs and toasts to a Next.js app built on the Next.js
  Agent Kit. Use when implementing alert, confirm, prompt dialogs, sonner
  toasts, session-expired banners, or any promise-based modal flow. Covers
  the Dialog object with bindable handlers, the DialogProvider queue
  component, keyboard handling, and the sonner Toaster mount.
---

# How to add dialogs and toasts

Dialogs are part of the kit core. The `Dialog` object and `DialogProvider` are mounted in the root layout (see `.ai/ui.md`). This skill documents how to use them and how to extend the provider.

## The `Dialog` object

```ts
// lib/client/dialog.ts
type BaseDialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export type DialogAlertOptions = string | BaseDialogOptions;
export type DialogConfirmOptions = string | BaseDialogOptions;
export type DialogPromptOptions = string | (BaseDialogOptions & { defaultValue?: string; placeholder?: string });

type DialogHandlers = {
  alert: (options: DialogAlertOptions) => Promise<void>;
  confirm: (options: DialogConfirmOptions) => Promise<boolean>;
  prompt: (options: DialogPromptOptions) => Promise<string | null>;
};

let handlers: DialogHandlers | null = null;

export const bindDialogHandlers = (next: DialogHandlers | null) => { handlers = next; };

export const Dialog = {
  async alert(options: DialogAlertOptions): Promise<void> {
    if (handlers) return handlers.alert(options);
    if (typeof window !== 'undefined') window.alert(typeof options === 'string' ? options : options.description ?? options.title ?? '');
  },
  async confirm(options: DialogConfirmOptions): Promise<boolean> {
    if (handlers) return handlers.confirm(options);
    if (typeof window !== 'undefined') return window.confirm(typeof options === 'string' ? options : options.description ?? options.title ?? '');
    return false;
  },
  async prompt(options: DialogPromptOptions): Promise<string | null> {
    if (handlers) return handlers.prompt(options);
    if (typeof window !== 'undefined') {
      const msg = typeof options === 'string' ? options : options.description ?? options.title ?? '';
      const def = typeof options === 'string' ? '' : options.defaultValue ?? '';
      return window.prompt(msg, def);
    }
    return null;
  },
};
```

The fallback to `window.alert`/`confirm`/`prompt` ensures `Dialog` works even before the `DialogProvider` mounts (e.g. during SSR or if the provider is missing). Once the provider mounts, it binds the real handlers.

## DialogProvider

Mounted once in the root layout. Binds the handlers on mount, renders a queued modal.

```tsx
// components/providers/dialog-provider.tsx
'use client';

import { Button } from '@/components/ui/button';
import { bindDialogHandlers, type DialogAlertOptions, type DialogConfirmOptions, type DialogPromptOptions } from '@/lib/client/dialog';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DialogQueueItem =
  | { kind: 'alert'; options: DialogAlertOptions; resolve: () => void }
  | { kind: 'confirm'; options: DialogConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'prompt'; options: DialogPromptOptions; resolve: (value: string | null) => void };

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DialogQueueItem[]>([]);
  const [promptValue, setPromptValue] = useState('');
  const current = queue[0] ?? null;
  const options = useMemo(() => current ? normalizeOptions(current.kind, current.options) : null, [current]);

  useEffect(() => {
    bindDialogHandlers({
      alert: (options) => new Promise<void>((resolve) => setQueue((prev) => [...prev, { kind: 'alert', options, resolve }])),
      confirm: (options) => new Promise<boolean>((resolve) => setQueue((prev) => [...prev, { kind: 'confirm', options, resolve }])),
      prompt: (options) => new Promise<string | null>((resolve) => setQueue((prev) => [...prev, { kind: 'prompt', options, resolve }])),
    });
    return () => bindDialogHandlers(null);
  }, []);

  const close = () => setQueue((prev) => prev.slice(1));
  const handleConfirm = useCallback(() => {
    if (!current) return;
    if (current.kind === 'alert') current.resolve();
    if (current.kind === 'confirm') current.resolve(true);
    if (current.kind === 'prompt') current.resolve(promptValue);
    close();
  }, [current, promptValue]);
  const handleCancel = useCallback(() => {
    if (!current) return;
    if (current.kind === 'alert') current.resolve();
    if (current.kind === 'confirm') current.resolve(false);
    if (current.kind === 'prompt') current.resolve(null);
    close();
  }, [current]);

  // Escape to cancel, Enter to confirm (except for alert)
  useEffect(() => {
    if (!current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleCancel(); }
      if (e.key === 'Enter' && current.kind !== 'alert') { e.preventDefault(); handleConfirm(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, handleCancel, handleConfirm]);

  return (
    <>
      {children}
      {current && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={current.kind === 'alert' ? undefined : handleCancel}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 className="text-sm font-semibold">{options.title}</h2>
            {options.description && <p className="text-xs text-muted-foreground">{options.description}</p>}
            {current.kind === 'prompt' && (
              <input defaultValue={options.defaultValue} placeholder={options.placeholder} onChange={(e) => setPromptValue(e.target.value)} autoFocus className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" />
            )}
            <div className="mt-4 flex justify-end gap-2">
              {current.kind !== 'alert' && <Button variant="outline" onClick={handleCancel}>{options.cancelText}</Button>}
              <Button variant={options.destructive ? 'destructive' : 'default'} onClick={handleConfirm}>{options.confirmText}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Usage

```ts
import { Dialog } from '@/lib/client/dialog';

// Alert
await Dialog.alert({ title: 'Notice', description: 'Something happened.' });

// Confirm
const confirmed = await Dialog.confirm({
  title: 'Delete document',
  description: 'This cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  destructive: true,
});
if (!confirmed) return;

// Prompt
const name = await Dialog.prompt({ title: 'Rename', description: 'Enter a new name.', defaultValue: currentName });
if (!name) return;
```

## sonner toasts

Mount once in the app layout:

```tsx
import { Toaster } from '@/components/ui/sonner';
<Toaster position="top-center" />
```

```ts
import { toast } from 'sonner';
toast.success('Saved');
toast.error('Failed to save');
```

## Session-expired flow

The `Client` class (see the auth skill) calls `Dialog.confirm` when the refresh token fails. The user gets a "Session expired" dialog with "Go to login" / "Stay here". On confirm, `client.logout()` clears storage and navigates to `/auth`.

## Rules

- `Dialog` is the only way to show a blocking modal from client code. Do not call `window.alert` or `window.confirm` directly.
- The provider is a queue, not a stack. Multiple `Dialog.confirm` calls line up and resolve in order.
- The `Dialog` object is safe to call before the provider mounts: it falls back to the native browser dialogs.
- `sonner` toasts are for non-blocking notifications. Use `Dialog` for blocking confirmations.
- Escape cancels, Enter confirms (except for alert where Enter does nothing, only the button confirms).

## Checklist

- [ ] `lib/client/dialog.ts` created
- [ ] `components/providers/dialog-provider.tsx` created
- [ ] `DialogProvider` mounted in `app/layout.tsx`
- [ ] `sonner` Toaster mounted in the app layout
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created