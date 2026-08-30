# Route and controller

A sample public route that accepts an email and sends a waitlist notification to Telegram. Mirrors the source `/contact` endpoint. The form UI is documented in the landing skill at `landing/references/waitlist.md`.

## Files

```
app/api/notifications/telegram/route.ts   # public POST, no withDB, no withAuth
controllers/telegram.controller.ts       # TelegramController.handleNotificationRequest
services/telegram.ts                     # TelegramService (see references/service.md)
```

## Route handler

Thin, delegates to the controller. No `withDB` (this feature has no database) and no `withAuth` (the form is unauthenticated). This matches the public route pattern in `.ai/services.md`.

```ts
// app/api/notifications/telegram/route.ts
import { TelegramController } from '@/controllers/telegram.controller';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
  return TelegramController.handleNotificationRequest(req);
}
```

Add `/api/notifications/telegram` to `PUBLIC_API_PREFIXES` (see `references/config-env.md`).

## Controller

Validates the body, builds the message from a template, calls `TelegramService.send`, and maps the three outcomes to HTTP. Reads nothing from `process.env` directly.

```ts
// controllers/telegram.controller.ts
import { NextResponse } from 'next/server';
import { TelegramService } from '@/services/telegram';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_BYTES = 16 * 1024;

export class TelegramController {
  public static handleNotificationRequest = async (req: Request): Promise<NextResponse> => {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ status: 'telegram_error' }, { status: 413 });
    }

    let body: { email?: string; appName?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ status: 'telegram_error' }, { status: 400 });
    }

    const email = (body.email ?? '').trim();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ status: 'telegram_error' }, { status: 400 });
    }

    const text = TelegramService.waitlistMessage({ email, appName: body.appName });
    try {
      const result = await TelegramService.send(text);
      if (result.status === 'skipped') {
        return NextResponse.json({ status: 'skipped' }, { status: 202 });
      }
      return NextResponse.json({ status: 'sent' }, { status: 200 });
    } catch (err) {
      console.error('Telegram send failed:', err);
      return NextResponse.json({ status: 'telegram_error' }, { status: 502 });
    }
  };
}
```

## Response contract

The body shape is source-faithful, not the kit `AuthResult` envelope, because this is a public unauthenticated endpoint and the landing form keys off it:

| outcome | status code | body |
|---|---|---|
| delivered | 200 | `{ status: 'sent' }` |
| credentials not configured | 202 | `{ status: 'skipped' }` |
| bad body or invalid email | 400 or 413 | `{ status: 'telegram_error' }` |
| Bot API or network failure | 502 | `{ status: 'telegram_error' }` |

## Wiring the landing waitlist form

The landing skill ships the form UI at `landing/references/waitlist.md`. That form posts to `/api/waitlist` and treats any `response.ok` as success. Two ways to wire telegram into it:

1. Point the form at this route. Change the fetch URL in `components/landing/waitlist.tsx` from `/api/waitlist` to `/api/notifications/telegram`, and send `{ email, appName: 'My app' }`. Drop the `WaitlistEntry` model if you do not need persistence. This matches the source, which kept no database and recovered emails from the Telegram chat history.

2. Keep persistence and add telegram as a side effect. Leave the form on `/api/waitlist`. In `WaitlistController.handleCreateRequest`, after the entry is saved, call `TelegramService.send(TelegramService.waitlistMessage({ email }))` as fire-and-forget (catch and log, do not fail the request if telegram fails). This gives you both a DB record and a notification.

Either way, the kit form checks `response.ok` only, so `202 skipped` renders as success. If you want `skipped` and `telegram_error` to surface as failure in the form, check `data.status === 'sent'` instead of `response.ok`, as the source form did.

## Other endpoints

The source had two more endpoints with the same shape: `/install` and `/feedback`. To add them, create `app/api/notifications/telegram/install/route.ts` and `app/api/notifications/telegram/feedback/route.ts` with their own controller methods, using the templates in `references/message-templates.md`. The prefix `/api/notifications/telegram` is already public, so both sub-routes are reachable without adding more allowlist entries.
