# Message templates

Plain-text message builders composed as newline-joined strings. Each has a leading emoji header, a blank line, labelled fields, a blank line, and a trailing ISO 8601 timestamp. No `parse_mode` is set on the `sendMessage` body, so the text renders verbatim.

These are static methods on `TelegramService` (see `references/service.md`). Keep them in `services/telegram.ts`, or extract to `lib/server/telegram-templates.ts` if the file grows past ~400 lines.

## Timestamp

Use Luxon, not native `Date`. The kit stores and logs dates as ISO 8601 via `DateTime.fromISO()` with the default zone (Europe/Rome). For a notification stamp, `DateTime.now().toISO()` is the idiomatic call.

```ts
import { DateTime } from 'luxon';
const stamp = DateTime.now().toISO();
```

## Waitlist / contact

Mirrors the source `/contact` endpoint used by the landing page waitlist form.

```ts
// inside TelegramService
static waitlistMessage(params: { email: string; appName?: string }): string {
  const appName = params.appName ?? 'My app';
  const stamp = DateTime.now().toISO();
  return [
    '📣 New waitlist signup',
    '',
    `App: ${appName}`,
    `Email: ${params.email}`,
    '',
    `Time: ${stamp}`,
  ].join('\n');
}
```

## Install

Mirrors the source `/install` endpoint. Fired when a user installs the app.

```ts
static installMessage(params: {
  appName?: string;
  installationId: string;
  platform?: string;
  appVersion?: string;
  buildNumber?: string;
}): string {
  const appName = params.appName ?? 'My app';
  const stamp = DateTime.now().toISO();
  return [
    '🎉 New installation',
    '',
    `App: ${appName}`,
    `Installation: ${params.installationId}`,
    `Platform: ${params.platform ?? 'unknown'}`,
    `Version: ${params.appVersion ?? 'unknown'} (${params.buildNumber ?? 'unknown'})`,
    '',
    `Time: ${stamp}`,
  ].join('\n');
}
```

## Feedback

Mirrors the source `/feedback` endpoint. User-submitted message from inside the app.

```ts
static feedbackMessage(params: {
  appName: string;
  message: string;
  platform?: string;
  email?: string;
  installationId?: string;
}): string {
  const stamp = DateTime.now().toISO();
  const lines = [
    `💬 New feedback from ${params.appName}`,
    '',
    `Message: ${params.message}`,
  ];
  if (params.platform) lines.push(`Platform: ${params.platform}`);
  if (params.email) lines.push(`Email: ${params.email}`);
  if (params.installationId) lines.push(`Installation: ${params.installationId}`);
  lines.push('', `Time: ${stamp}`);
  return lines.join('\n');
}
```

## Rules

- Plain text only. No Markdown bold or italic, no HTML. The fields are labels, not formatted tokens.
- One emoji header per message type, chosen to scan quickly in a crowded chat.
- Always end with `Time:` as the last line. ISO 8601 sorts lexicographically.
- Use `??` for optional field defaults, not a ternary, per the no-ternary rule.
- Keep the message under 4096 characters, the Telegram `sendMessage` text limit. The body-size guard in the route handler caps the request at 16 KB, so templates are safe.
