# Paddle

## Config

```ts
static readonly paddle = {
  api_key: process.env.PADDLE_API_KEY!,
  environment: (process.env.PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'production',
  webhook_secret: process.env.PADDLE_WEBHOOK_SECRET!,
  price_id: process.env.PADDLE_PRICE_ID,
};
```

## Service

```ts
// services/paddle.ts
import 'server-only';
import { Environment, EventName, Paddle } from '@paddle/paddle-node-sdk';
import { Config } from '@/lib/server/config';

let paddle: Paddle | null = null;
function getClient(): Paddle {
  if (!paddle) {
    paddle = new Paddle(Config.paddle.api_key, {
      environment: Config.paddle.environment === 'sandbox' ? Environment.sandbox : Environment.production,
    });
  }
  return paddle;
}

export class PaddleService {
  static async createCheckoutSession({ priceId, returnUrl, customData }: {
    priceId: string; returnUrl?: string; customData?: Record<string, string>;
  }): Promise<{ transaction_id: string; checkout_url: string }> {
    const transaction = await getClient().transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { type: 'subscription', ...customData },
      ...(returnUrl && { checkout: { url: returnUrl } }),
    });
    const checkoutUrl = transaction.checkout?.url;
    if (!checkoutUrl) throw new Error('No checkout URL returned');
    return { transaction_id: transaction.id, checkout_url: checkoutUrl };
  }

  static async processWebhook(rawBody: string, webhookSecret: string, signature: string, handlers: PaddleWebhookHandlers): Promise<PaddleWebhookResult> {
    try {
      const eventData = await getClient().webhooks.unmarshal(rawBody, webhookSecret, signature);
      const handlerMap = {
        [EventName.SubscriptionCreated]: handlers.onSubscriptionCreated,
        [EventName.SubscriptionCanceled]: handlers.onSubscriptionCanceled,
        [EventName.SubscriptionPaused]: handlers.onSubscriptionPaused,
        [EventName.SubscriptionResumed]: handlers.onSubscriptionResumed,
        [EventName.SubscriptionPastDue]: handlers.onSubscriptionPastDue,
      };
      const handler = handlerMap[eventData.eventType as string];
      if (handler) {
        await handler(eventData.eventType as string, eventData.data as Record<string, unknown>, { subscriptionId: (eventData.data as { id?: string }).id });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Webhook verification failed', statusCode: 400 };
    }
  }
}
```

## Controller

```ts
// controllers/paddle.controller.ts
import { Config } from '@/lib/server/config';
import { JwtAuth } from '@/proxy/jwt-auth';
import { PaddleService } from '@/services/paddle';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';
import { UserController } from './user.controller';

export class PaddleController {
  static handleCheckoutRequest = async (req: NextRequest): Promise<NextResponse> => {
    const jwt = JwtAuth.getFromHeaders(req);
    const userId = jwt?.user_id;
    const priceId = Config.paddle.price_id;
    if (!priceId) return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    const session = await PaddleService.createCheckoutSession({
      priceId,
      returnUrl: req.nextUrl.origin,
      customData: { user_id: userId || '' },
    });
    return NextResponse.json({ url: session.checkout_url });
  };

  static handleWebhookRequest = async (req: NextRequest): Promise<NextResponse> => {
    const rawBody = await req.text();
    const signature = req.headers.get('paddle-signature') || '';
    const result = await PaddleService.processWebhook(rawBody, Config.paddle.webhook_secret, signature, {
      onSubscriptionCreated: async (_eventType, data) => {
        const customData = (data as { customData?: Record<string, string> }).customData;
        const userId = customData?.user_id;
        if (userId) {
          await UserController.patch(userId, {
            subscription_status: 'active',
            paddle_customer_id: (data as { customerId?: string }).customerId,
            paddle_subscription_id: (data as { id?: string }).id,
            subscription_started_at: DateTime.now().toISO(),
          });
        }
      },
      onSubscriptionCanceled: async (_eventType, data) => {
        const userId = (data as { customData?: Record<string, string> }).customData?.user_id;
        if (userId) await UserController.patch(userId, { subscription_status: 'expired' });
      },
      // onSubscriptionPaused, onSubscriptionResumed, onSubscriptionPastDue similar
    });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: result.statusCode || 500 });
    return NextResponse.json({ received: true });
  };
}
```

## Routes

```ts
// app/api/paddle/checkout/route.ts
import { PaddleController } from '@/controllers/paddle.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return PaddleController.handleCheckoutRequest(req);
}
```

```ts
// app/api/webhooks/paddle/route.ts
import { PaddleController } from '@/controllers/paddle.controller';
import { withDB } from '@/middlewares/db-wrapper';
import { NextRequest } from 'next/server';

export const POST = withDB(async (req: NextRequest) => PaddleController.handleWebhookRequest(req));
```

Add `/api/webhooks` and `/api/paddle/checkout` to the proxy. The checkout route reads the JWT from headers (it is auth-gated) but is in `PUBLIC_API_PREFIXES` only if you want the proxy to skip the JWT check and let the handler do it. The kit pattern: keep checkout out of the public list so the proxy enforces JWT, then the handler reads `JwtAuth.getFromHeaders`. Webhooks must be in the public list.