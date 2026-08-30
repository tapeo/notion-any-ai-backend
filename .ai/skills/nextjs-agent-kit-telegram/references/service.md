# TelegramService

A server-only static class that sends plain-text messages to one configured Telegram chat via the Bot API `sendMessage` method. This is send-only: no `getUpdates`, no webhook, no incoming-message handling. Messages target a single chat defined by `TELEGRAM_CHAT_ID`.

Distilled from a production Next.js landing page that proxied to a Cloud Run Express service. The two tiers collapse into one here: the route handler calls `TelegramService` directly. The bot token and chat id never leave the server.

## Files

```
services/telegram.ts          # TelegramService, TelegramError, message templates
lib/server/config.ts          # Config.telegram section (see references/config-env.md)
```

## TelegramConfig

Define the config interface in `lib/server/config.ts` so there is no import cycle with the service:

```ts
// lib/server/config.ts (add near the top, exported)
export interface TelegramConfig {
  bot_token: string;
  chat_id: string;
}
```

## TelegramService

```ts
// services/telegram.ts
import 'server-only';
import { DateTime } from 'luxon';
import { Config, type TelegramConfig } from '@/lib/server/config';

export type TelegramSendStatus = 'sent' | 'skipped';

export interface TelegramSendResult {
  status: TelegramSendStatus;
}

export class TelegramError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TelegramError';
  }
}

export class TelegramService {
  static async send(text: string): Promise<TelegramSendResult> {
    const config = Config.telegram;
    if (!config) {
      return { status: 'skipped' };
    }
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chat_id,
          text,
          disable_web_page_preview: true,
        }),
      });
    } catch (err) {
      throw new TelegramError(`Network error: ${(err as Error).message}`);
    }
    if (!response.ok) {
      const body = await response.text();
      throw new TelegramError(`Telegram API ${response.status}: ${body}`, response.status);
    }
    return { status: 'sent' };
  }
}
```

## Send contract

`send(text)` has three outcomes, mirrored by the controller into HTTP:

| outcome | return | HTTP |
|---|---|---|
| delivered | `{ status: 'sent' }` | 200 |
| credentials not configured | `{ status: 'skipped' }` (no throw) | 202 |
| Bot API rejected or network failed | throws `TelegramError` | 502 |

`skipped` is a no-op, not an error. It lets the app run without telegram configured (staging, local dev). The controller catches `TelegramError` and maps it to `502 { status: 'telegram_error' }`.

## Rules

- `import 'server-only'` at the top. Never import this service from a client component.
- The service returns typed data (`TelegramSendResult`), never `NextResponse`. The controller builds HTTP responses.
- Read credentials only from `Config.telegram`. Never touch `process.env` here.
- No `parse_mode` is set, so `text` renders as plain text. No Markdown or HTML escaping is needed. To add formatting, set `parse_mode: 'MarkdownV2'` and escape special characters, or `parse_mode: 'HTML'`.
- No `reply_markup`, so no inline buttons. Add a `reply_markup` object to the body for keyboards.
- `disable_web_page_preview: true` keeps links from expanding into a preview card. Keep it for compact admin notifications.
- The service is fire-and-forget from the caller's perspective only if the caller ignores the result. The controller in `references/route-and-controller.md` awaits it and maps the outcome.
- One destination chat. To fan out to multiple chats, loop over an array of `chat_id` values and call `send` per chat, or extend `TelegramConfig` with a `chat_ids: string[]`.
