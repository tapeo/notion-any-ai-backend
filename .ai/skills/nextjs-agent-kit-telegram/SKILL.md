---
name: nextjs-agent-kit-telegram
description: >-
  Send admin notifications to a Telegram chat from a Next.js app built on the
  Next.js Agent Kit. Use when wiring a waitlist or contact form, an install
  event, or user feedback to a Telegram bot via the Bot API sendMessage method.
  Covers the server-only TelegramService, the Config.telegram section, plain
  text message templates, the sent|skipped|telegram_error response contract,
  and a sample public POST route. Send only, no incoming updates or webhooks.
---

# How to send Telegram notifications

Telegram notifications are **opt-in**. Build them when your app needs to push admin messages (waitlist signups, installs, feedback) to a Telegram chat you control. This skill is send-only: it calls the Bot API `sendMessage` method. It does not receive updates, poll `getUpdates`, or register a webhook.

Distilled from a production Next.js landing page that proxied waitlist signups through a Cloud Run Express service to Telegram. The two tiers collapse into one here: a Next.js route handler calls `TelegramService` directly. The bot token and chat id never leave the server. No database is involved, faithful to the source, which kept no persistence and recovered messages from the Telegram chat history.

## What you need to build

```
services/telegram.ts                       # TelegramService, TelegramError, message templates
controllers/telegram.controller.ts         # handleNotificationRequest -> NextResponse
app/api/notifications/telegram/route.ts    # public POST, thin, delegates to controller
lib/server/config.ts                       # add Config.telegram section + TelegramConfig
proxy.ts                                    # add /api/notifications/telegram to PUBLIC_API_PREFIXES
.env.example / .env.local / .env.production # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
```

No `model/` or `schemas/` folders. This feature has no database.

## Architecture

```
[form / controller] -> TelegramService.send(text) -> POST https://api.telegram.org/bot<TOKEN>/sendMessage
                                                              |
                                                              v
                                                        one configured chat
```

One destination chat, set by `TELEGRAM_CHAT_ID`. Messages are plain text with an emoji header, labelled fields, and an ISO 8601 timestamp. The response contract is `{ status: 'sent' | 'skipped' | 'telegram_error' }`.

## Config

`Config.telegram` is `undefined` when the env vars are missing, so the app runs without telegram configured. The service returns `skipped` instead of throwing. See `references/config-env.md` for the full section, env vars, deploy wiring, and the proxy allowlist.

```ts
static readonly telegram: TelegramConfig | undefined =
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    ? { bot_token: process.env.TELEGRAM_BOT_TOKEN, chat_id: process.env.TELEGRAM_CHAT_ID }
    : undefined;
```

## TelegramService

A server-only static class. `send(text)` returns `{ status: 'sent' }` on delivery, `{ status: 'skipped' }` when not configured, and throws `TelegramError` on Bot API or network failure. The controller maps these to HTTP. See `references/service.md` for the full implementation.

## Message templates

Plain-text builders with an emoji header and a trailing ISO timestamp (Luxon, not native `Date`). Three templates: waitlist, install, feedback. See `references/message-templates.md`.

```ts
TelegramService.waitlistMessage({ email: 'user@example.com', appName: 'My app' });
// -> "📣 New waitlist signup\n\nApp: My app\nEmail: user@example.com\n\nTime: 2026-07-31T12:01:00+02:00"
```

## Route and controller

A public `POST /api/notifications/telegram` route accepts `{ email, appName? }`, validates the email, guards the body size, and calls the service. See `references/route-and-controller.md` for the route, the controller, the response contract table, and how to wire the landing waitlist form to it.

The landing skill ships the form UI at `landing/references/waitlist.md`. Point that form at this route, or call `TelegramService` from `WaitlistController` as a side effect if you also persist entries.

## Rules

- `import 'server-only'` at the top of `services/telegram.ts`. Never import it from a client component.
- Credentials are server-only. Never use `NEXT_PUBLIC_`. Read them only via `Config.telegram`, never `process.env` in the service or controller.
- The service returns typed data, never `NextResponse`. The controller builds HTTP responses.
- `skipped` is a 202 no-op, not an error. It keeps the app running without telegram configured.
- No `parse_mode` on the `sendMessage` body, so text is plain. No Markdown or HTML escaping. Add `parse_mode` and `reply_markup` only if you need formatting or buttons.
- `disable_web_page_preview: true` stays set, for compact admin messages.
- One destination chat. No fan-out, no per-user chats, no incoming updates.
- No database. If you also want persistence, pair this with the landing skill's `WaitlistEntry` model and call the service as a side effect.

## Checklist

- [ ] `lib/server/config.ts` extended with `TelegramConfig` and `Config.telegram`
- [ ] `services/telegram.ts` created with `TelegramService`, `TelegramError`, and message templates
- [ ] `controllers/telegram.controller.ts` created
- [ ] `app/api/notifications/telegram/route.ts` created
- [ ] `/api/notifications/telegram` added to `PUBLIC_API_PREFIXES` in `proxy.ts`
- [ ] `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` added to `.env.example`, `.env.local`, `.env.production`
- [ ] Deploy `secretKeyRef` blocks added (k3s) or env vars set (Cloud Run, Vercel)
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created

## Reference catalog

| file | covers |
|---|---|
| `references/service.md` | TelegramService, TelegramError, TelegramConfig, send contract |
| `references/config-env.md` | Config section, env vars, deploy wiring, proxy allowlist |
| `references/message-templates.md` | waitlist, install, feedback plain-text templates |
| `references/route-and-controller.md` | sample route, controller, response contract, landing form wiring |
