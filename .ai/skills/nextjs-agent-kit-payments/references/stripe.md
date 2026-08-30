# Stripe

## Config

```ts
static readonly stripe = {
  secret_key: process.env.STRIPE_SECRET_KEY!,
  webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
};
```

## Service

```ts
// services/stripe.ts
import 'server-only';
import Stripe from 'stripe';
import { Config } from '@/lib/server/config';

export class StripeService {
  private static stripe: Stripe | null = null;

  private static getClient(): Stripe {
    if (!this.stripe) this.stripe = new Stripe(Config.stripe.secret_key);
    return this.stripe;
  }

  static async createCheckoutSession({ customerId, priceId, successUrl, cancelUrl }: {
    customerId: string; priceId: string; successUrl: string; cancelUrl: string;
  }): Promise<string> {
    const session = await this.getClient().checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url!;
  }

  static async createCustomer(id: string, name: string, email: string): Promise<string> {
    const customer = await this.getClient().customers.create({ email, name, metadata: { user_id: id } });
    return customer.id;
  }

  static async isSubscriptionActive(subscriptionId: string): Promise<boolean> {
    try {
      const sub = await this.getClient().subscriptions.retrieve(subscriptionId);
      return sub.status === 'active' || sub.status === 'trialing';
    } catch {
      return false;
    }
  }

  static async handleWebhookEvent(signature: string, payload: Buffer): Promise<Stripe.Event> {
    return this.getClient().webhooks.constructEvent(payload, signature, Config.stripe.webhook_secret);
  }
}
```

## Webhook route

```ts
// app/api/webhooks/stripe/route.ts
import { StripeService } from '@/services/stripe';
import { UserController } from '@/controllers/user.controller';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  const payload = Buffer.from(await req.arrayBuffer());
  const event = await StripeService.handleWebhookEvent(signature, payload);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId && session.subscription) {
      const subscription = await StripeService.getSubscription(session.subscription as string);
      await UserController.patch(userId, {
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
      });
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await UserController.patch(sub.metadata.user_id, { subscription_status: 'expired' });
  }

  return NextResponse.json({ received: true });
}
```

Add `/api/webhooks` to `PUBLIC_API_PREFIXES`. Stripe sends the signature in the `stripe-signature` header. Read the raw body with `Buffer.from(await req.arrayBuffer())` because the signature is computed over the raw bytes.