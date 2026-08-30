# Waitlist

An email capture form rendered below the pricing cards. Client component because it tracks form state. Uses a discriminated state union, not a ternary, for the render.

Imported by `references/pricing.md`. The `Pricing` server component renders `<Waitlist />` below the tier cards.

## Component

```tsx
// components/landing/waitlist.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function Waitlist() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [email, setEmail] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormState('submitting');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      setFormState('success');
      setEmail('');
    } catch {
      setFormState('error');
    }
  }

  return renderState(formState, email, setEmail, handleSubmit);
}

function renderState(
  state: FormState,
  email: string,
  setEmail: (v: string) => void,
  handleSubmit: (e: React.FormEvent) => void,
) {
  if (state === 'success') {
    return <p className="text-sm text-primary">You are on the list. We will be in touch.</p>;
  }
  if (state === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        <WaitlistForm email={email} setEmail={setEmail} onSubmit={handleSubmit} submitting={false} />
      </div>
    );
  }
  return (
    <WaitlistForm
      email={email}
      setEmail={setEmail}
      onSubmit={handleSubmit}
      submitting={state === 'submitting'}
    />
  );
}

function WaitlistForm({
  email,
  setEmail,
  onSubmit,
  submitting,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="sm:max-w-xs"
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Joining...' : 'Join the waitlist'}
      </Button>
    </form>
  );
}
```

## Notes

- The form state is a discriminated union, not a ternary. `renderState` uses `if` blocks to pick the tree. This follows the kit's no-ternary rule.
- `submitting ? 'Joining...' : 'Join the waitlist'` is a single-value pick for a label string, not a nested conditional tree. Allowed.
- The form posts to `/api/waitlist`. Build that route handler (below) following `.ai/services.md`.

## Route handler

This is a public route, so add it to the proxy allowlist (see `.ai/architecture.md`).

```ts
// app/api/waitlist/route.ts
import { WaitlistController } from '@/controllers/waitlist.controller';
import { withDB } from '@/middlewares/db-wrapper';

export const POST = withDB(async (request: Request) => {
  return WaitlistController.handleCreateRequest(request);
});
```

Follow `.ai/data.md` for the `WaitlistEntry` model and schema. Follow `.ai/services.md` for the controller.
