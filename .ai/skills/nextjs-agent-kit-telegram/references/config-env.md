# Config and environment

Telegram credentials are server-only. They never use the `NEXT_PUBLIC_` prefix and never reach the client bundle. The `Config` class reads them at module load. When unset, `Config.telegram` is `undefined` and `TelegramService.send` returns `skipped` instead of throwing, so the app runs without telegram configured.

## Config section

Add to `lib/server/config.ts`, alongside the existing `mongo`, `jwt`, and `app` sections. Define the interface here to avoid an import cycle with the service.

```ts
// lib/server/config.ts
import 'server-only';

export interface TelegramConfig {
  bot_token: string;
  chat_id: string;
}

export class Config {
  // ...existing sections...

  static readonly telegram: TelegramConfig | undefined =
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
      ? {
          bot_token: process.env.TELEGRAM_BOT_TOKEN,
          chat_id: process.env.TELEGRAM_CHAT_ID,
        }
      : undefined;
}
```

The `: undefined` fallback mirrors the email skill's `Config.email` pattern: a feature can be "not configured" without crashing the process. This is deliberate for local dev and staging.

## Environment variables

| variable | required | scope | purpose |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | no | server | Bot API token from BotFather |
| `TELEGRAM_CHAT_ID` | no | server | Destination chat id (your own chat, a group, or a channel) |

Both are optional. If either is missing, `Config.telegram` is `undefined` and sends silently no-op with `202 { status: 'skipped' }`.

### `.env.example`

Add to the committed reference:

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### `.env.local` and `.env.production`

Fill real values, gitignored. For the bot token, use the value from BotFather. For the chat id, send any message to the bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and read `chat.id` from the response.

## Deploy wiring

### k3s

Add a `secretKeyRef` block per variable in `deploy.yaml`, sourcing from the `my-app-env` secret (the deploy script syncs `.env.production` into it). See `.ai/setup.md` for the full manifest shape.

```yaml
- name: TELEGRAM_BOT_TOKEN
  valueFrom:
    secretKeyRef:
      name: my-app-env
      key: TELEGRAM_BOT_TOKEN
- name: TELEGRAM_CHAT_ID
  valueFrom:
    secretKeyRef:
      name: my-app-env
      key: TELEGRAM_CHAT_ID
```

### GCP Cloud Run

The kit's `deploy.sh` passes `.env.production` via `--env-vars-file`. Add the two variables to `.env.production` and they ship automatically. To enforce them at deploy time like the source did, add a guard at the top of `deploy.sh`:

```bash
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set for telegram notifications."
  exit 1
fi
```

Skip this guard if you want telegram to be optional per environment.

### Vercel

Set both variables in the Vercel dashboard. They are server-only (no `NEXT_PUBLIC_` prefix), so they are available to route handlers and not inlined into the client bundle.

## Proxy allowlist

The sample route `POST /api/notifications/telegram` is public (no JWT). Add it to `PUBLIC_API_PREFIXES` in `proxy.ts`:

```ts
private static readonly PUBLIC_API_PREFIXES = [
  // ...existing entries...
  '/api/notifications/telegram',
];
```

The allowlist is prefix-matched. Adding the full sub-path makes only `/api/notifications/telegram` public. The sibling `/api/notifications` routes (FCM in-app notification CRUD from the notifications skill) stay auth-gated because `/api/notifications` does not start with `/api/notifications/telegram`. Next.js also prefers the static `telegram` segment over the dynamic `[id]` segment, so the route does not collide with `app/api/notifications/[id]/route.ts`.
