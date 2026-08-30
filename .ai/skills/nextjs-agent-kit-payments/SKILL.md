---
name: nextjs-agent-kit-payments
description: >-
  Add payments and subscriptions to a Next.js app built on the Next.js Agent
  Kit. Use when implementing checkout, customer portal, subscription status,
  entitlement gating, or webhook handling for Stripe, Paddle, or Dodo
  Payments. Covers the service classes, checkout route handlers, webhook
  signature verification, subscription_status field on the user, and
  entitlement checks in the app shell.
---

# How to add payments

Payments are **opt-in**. Pick one provider (Stripe, Paddle, or Dodo Payments) and build only that. The kit supports all three with the same shape: a service class, a checkout route, a webhook route, and a `subscription_status` field on the user.

## What you need to build

```
lib/server/config.ts               # Config.stripe / Config.paddle / Config.dodo sections
services/
  stripe.ts                        # StripeService static class
  paddle.ts                        # PaddleService static class
  dodo-payments.ts                 # DodoPaymentsService static class
controllers/
  paddle.controller.ts             # handleCheckoutRequest, handleWebhookRequest
  dodo.controller.ts               # handleCheckoutRequest
model/
  paddle.ts                        # Paddle webhook types, handlers
  dodo-payments.ts                 # Dodo webhook types
  user.ts                          # add subscription_status, <provider>_customer_id, <provider>_subscription_id
app/api/
  paddle/checkout/route.ts         # POST, auth-gated
  dodo/checkout/route.ts           # POST, auth-gated
  webhooks/paddle/route.ts         # POST, public, signature verified
  webhooks/dodo/route.ts           # POST, public, signature verified
  webhooks/stripe/route.ts         # POST, public, signature verified
hooks/
  subscription.hook.ts             # useSubscription (reads from useUser)
```

## Steps

| step | reference | what |
| ---- | --------- | ---- |
| 0 | (below) | Add subscription fields to the user model and schema |
| 1 | `references/stripe.md` | StripeService, checkout, webhook |
| 2 | `references/paddle.md` | PaddleService, checkout, webhook with handlers |
| 3 | `references/dodo.md` | DodoPaymentsService, checkout, webhook with standardwebhooks |
| 4 | (below) | Entitlement gating in the app shell |

## Step 0: User fields

Add to `model/base-user.ts`:

```ts
dodo_customer_id?: string;
dodo_subscription_id?: string;
paddle_customer_id?: string;
paddle_subscription_id?: string;
subscription_status?: string;     // 'active', 'past_due', 'expired', 'paused'
subscription_started_at?: string;
```

Add the matching fields to `schemas/base-user.schema.ts` with `type: String, default: null`.

## Step 4: Entitlement gating

Read `subscription_status` from `useUser`. Gate features in the app shell or per-route:

```tsx
const { user } = useUser();
const isSubscribed = user?.subscription_status === 'active';
if (!isSubscribed) return <Paywall />;
```

For server-side gating, read `user.subscription_status` in the controller and return 403 if not active.

## Rules

- Webhook routes are public (no JWT) but verify the provider signature in the handler.
- The webhook handler updates `subscription_status`, `<provider>_customer_id`, and `<provider>_subscription_id` on the user via `UserController.patch`.
- Checkout routes are auth-gated. They read the user from `JwtAuth.getFromHeaders` and pass `user_id` in the provider's `customData`/`metadata` so the webhook can link the subscription to the user.
- The `subscription_status` field is the single source of truth for entitlement. Read it from the user, do not query the provider API on every request.
- Webhook signature verification: Stripe uses `stripe.webhooks.constructEvent`, Paddle uses the SDK's `webhooks.unmarshal`, Dodo uses `standardwebhooks`'s `Webhook.verify`.

## Checklist

- [ ] User model and schema extended with subscription fields
- [ ] `lib/server/config.ts` extended with `Config.stripe` / `Config.paddle` / `Config.dodo`
- [ ] Service class created (`services/<provider>.ts`)
- [ ] Checkout route handler created (`app/api/<provider>/checkout/route.ts`)
- [ ] Webhook route handler created (`app/api/webhooks/<provider>/route.ts`)
- [ ] `PUBLIC_API_PREFIXES` includes `/api/webhooks` and `/api/<provider>/checkout` (checkout is auth-gated via JWT in the handler, not via the proxy allowlist, so it can stay protected; only webhooks are public)
- [ ] `.env.local` has the provider API key and webhook secret
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created