# Dodo Payments

## Config

```ts
static readonly dodo = {
  api_key: process.env.DODO_API_KEY!,
  environment: (process.env.DODO_ENVIRONMENT as 'test_mode' | 'live_mode') || 'live_mode',
  webhook_secret: process.env.DODO_WEBHOOK_SECRET!,
  product_id: process.env.DODO_PRODUCT_ID,
  return_url: process.env.DODO_RETURN_URL,
};
```

## Service

```ts
// services/dodo-payments.ts
import 'server-only';
import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';
import { Config } from '@/lib/server/config';

let dodo: DodoPayments | null = null;
function getClient(): DodoPayments {
  if (!dodo) {
    dodo = new DodoPayments({ bearerToken: Config.dodo.api_key, environment: Config.dodo.environment });
  }
  return dodo;
}

export class DodoPaymentsService {
  static async createCheckoutSession(options: { productId?: string; returnUrl?: string; metadata?: Record<string, string> }): Promise<{ session_id: string; checkout_url: string }> {
    const productId = options.productId || Config.dodo.product_id;
    if (!productId) throw new Error('Dodo product_id not configured');
    const session = await getClient().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: options.returnUrl ?? null,
      metadata: { type: 'subscription', ...options.metadata },
    });
    if (!session.checkout_url) throw new Error('No checkout URL');
    return { session_id: session.session_id, checkout_url: session.checkout_url };
  }

  static async processWebhook(req: Request): Promise<{ success: boolean; payload?: any; error?: string; statusCode?: number }> {
    const webhookSecret = Config.dodo.webhook_secret;
    if (!webhookSecret) return { success: false, error: 'Webhook secret not configured', statusCode: 500 };
    const rawBody = await req.text();
    const headers = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };
    try {
      const webhook = new Webhook(webhookSecret);
      webhook.verify(rawBody, headers);
      const payload = JSON.parse(rawBody);
      return { success: true, payload };
    } catch (error) {
      return { success: false, error: 'Webhook verification failed', statusCode: 400 };
    }
  }
}
```

## Checkout route

```ts
// app/api/dodo/checkout/route.ts
import { DodoController } from '@/controllers/dodo.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return DodoController.handleCheckoutRequest(req);
}
```

```ts
// controllers/dodo.controller.ts
import { JwtAuth } from '@/proxy/jwt-auth';
import { DodoPaymentsService } from '@/services/dodo-payments';
import { NextRequest, NextResponse } from 'next/server';

export class DodoController {
  static handleCheckoutRequest = async (req: NextRequest): Promise<NextResponse> => {
    const jwt = JwtAuth.getFromHeaders(req);
    const session = await DodoPaymentsService.createCheckoutSession({
      returnUrl: req.nextUrl.origin,
      metadata: { user_id: jwt?.user_id || '' },
    });
    return NextResponse.json({ url: session.checkout_url });
  };
}
```

## Webhook route

```ts
// app/api/webhooks/dodo/route.ts
import { DodoPaymentsService } from '@/services/dodo-payments';
import { UserController } from '@/controllers/user.controller';
import { withDB } from '@/middlewares/db-wrapper';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withDB(async (req: NextRequest) => {
  const result = await DodoPaymentsService.processWebhook(req);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
  const payload = result.payload;
  if (payload?.type === 'subscription.active' || payload?.type === 'subscription.created') {
    const userId = payload.data?.metadata?.user_id;
    if (userId) {
      await UserController.patch(userId, {
        subscription_status: 'active',
        dodo_customer_id: payload.data?.customer_id,
        dodo_subscription_id: payload.data?.subscription_id,
      });
    }
  }
  return NextResponse.json({ received: true });
});
```

Dodo uses `standardwebhooks` for signature verification. The headers are `webhook-id`, `webhook-signature`, `webhook-timestamp`. Read the raw body with `req.text()` (not `req.json()`) because the signature is computed over the raw string.