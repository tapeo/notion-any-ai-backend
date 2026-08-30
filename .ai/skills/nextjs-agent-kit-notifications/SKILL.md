---
name: nextjs-agent-kit-notifications
description: >-
  Add push notifications and in-app notifications to a Next.js app built on
  the Next.js Agent Kit. Use when implementing Firebase Cloud Messaging
  (FCM), push token sync, in-app notification CRUD, unread counts, or
  notification dispatch. Covers the FCM v1 HTTP API with a service account
  JWT, the Notification model and schema, the notification controller and
  routes, and the push_notifications_token field on the user.
---

# How to add notifications

Notifications are **opt-in**. Build them when your app needs push notifications (FCM) or an in-app notification center.

## What you need to build

```
model/notification.ts          # Notification interface
schemas/notification.schema.ts # Mongoose schema
services/firebase-notification.ts  # FirebaseNotificationService (FCM v1 HTTP API)
controllers/notification.controller.ts  # CRUD + dispatch
model/user.ts                  # add push_notifications_token field
app/api/notifications/
  route.ts                     # GET list, DELETE all
  [id]/route.ts                # GET, PATCH (mark read), DELETE
  mark-all-read/route.ts       # POST
  unread-count/route.ts        # GET
hooks/notification.hook.ts     # React Query hooks
```

## FCM v1 HTTP API

Use the v1 HTTP API (not the legacy API). Authenticate with a service account JWT, cached for ~50 minutes.

```ts
// services/firebase-notification.ts
import 'server-only';
import { Config } from '@/lib/server/config';
import { loadServiceAccountCredentials } from '@/lib/server/gcp';
import * as jwt from 'jsonwebtoken';

export class FirebaseNotificationService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  static async sendToToken(token: string, payload: { title: string; body: string; data?: Record<string, string> }): Promise<boolean> {
    const { projectId, clientEmail, privateKey } = this.getConfig();
    const accessToken = await this.getAccessToken(clientEmail, privateKey);
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ message: { token, notification: { title: payload.title, body: payload.body }, data: payload.data || {} } }),
    });
    return response.ok;
  }

  private static async getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) return this.cachedToken.token;
    const assertion = jwt.sign(
      { iss: clientEmail, sub: clientEmail, aud: 'https://oauth2.googleapis.com/token', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, scope: 'https://www.googleapis.com/auth/firebase.messaging' },
      privateKey.replace(/\\n/g, '\n'),
      { algorithm: 'RS256' },
    );
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
    });
    const data = await response.json();
    this.cachedToken = { token: data.access_token, expiresAt: Date.now() + 3500 * 1000 };
    return data.access_token;
  }

  private static getConfig() {
    const creds = loadServiceAccountCredentials(Config.firebase.credentials_base64);
    if (!creds) throw new Error('Firebase credentials missing');
    return { projectId: creds.project_id, clientEmail: creds.client_email, privateKey: creds.private_key };
  }
}
```

## Notification model and schema

```ts
// model/notification.ts
export interface Notification {
  _id?: string;
  user_id: string;
  title: string;
  body: string;
  message?: string;
  type?: string;
  read?: boolean;
  created_at?: string;
}
```

```ts
// schemas/notification.schema.ts
const notificationSchema = new Schema<Notification>({
  user_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  message: { type: String },
  type: { type: String },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});
notificationSchema.index({ user_id: 1, read: 1 });
```

## Controller and routes

The controller has `handle*Request` methods that read `userId` from `JwtAuth.getFromHeaders`, perform the CRUD operation, and return `NextResponse`. Routes compose `withDB(withAuth(...))`.

## Token sync

The client obtains an FCM token (via the Firebase SDK in a client component or a native mobile SDK) and POSTs it to a `/api/auth/me` sub-route or a dedicated `/api/notifications/token` route. The server stores it in `user.push_notifications_token`.

```ts
export const POST = withDB(withAuth(async (req, { auth }) => {
  const { token } = await req.json();
  await UserController.patch(auth.userId, { push_notifications_token: token });
  return NextResponse.json({ ok: true });
}));
```

On logout, clear the token so the device stops receiving notifications for the logged-out user.

## Rules

- The FCM access token is cached server-side for ~50 minutes. Do not request a new one per send.
- The service account JSON is base64-encoded in `FIREBASE_CREDENTIALS_BASE64`. Decode with `loadServiceAccountCredentials`.
- Notification reads are scoped by `user_id`. Always filter `find({ user_id: auth.userId })`.
- `sendToToken` is fire-and-forget from the calling controller's perspective: catch errors, log, do not fail the API request if FCM fails. The in-app notification is still created in the DB.

## Checklist

- [ ] `model/notification.ts` + `schemas/notification.schema.ts` created
- [ ] `services/firebase-notification.ts` created
- [ ] `controllers/notification.controller.ts` created
- [ ] `app/api/notifications/*` routes created
- [ ] User model extended with `push_notifications_token`
- [ ] `FIREBASE_CREDENTIALS_BASE64` env var set
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created