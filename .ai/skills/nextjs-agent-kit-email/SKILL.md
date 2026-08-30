---
name: nextjs-agent-kit-email
description: >-
  Add transactional email to a Next.js app built on the Next.js Agent Kit.
  Use when sending signup OTP, password reset, welcome, or notification
  emails through Plunk, MailerSend, Brevo, or a custom SMTP server. Covers
  the unified EmailService router, per-provider service classes, the
  SendEmailParams interface, and the OTP schema for email verification.
---

# How to add email

Email is **opt-in**. Build it when your app needs transactional email (signup OTP, password reset, welcome, notifications). The kit ships a unified `EmailService` that routes to one of four providers based on `Config.email.provider`.

## What you need to build

```
lib/server/config.ts               # Config.email, Config.brevo, Config.email.plunk, etc.
services/
  email.ts                         # EmailService.send (unified router)
  plunk.ts                         # PlunkService
  mailersend.ts                    # MailerSendService
  brevo.ts                         # BrevoService (nodemailer + Brevo SMTP)
  smtp.ts                          # CustomSmtpService (nodemailer)
  nodemailer.ts                    # NodemailerService (generic)
schemas/otp.schema.ts              # OTP for email verification (optional)
```

## Config

```ts
static readonly brevo = {
  smtp_user: process.env.BREVO_SMTP_USER!,
  api_key: process.env.BREVO_API_KEY!,
  from_name: process.env.EMAIL_FROM_NAME!,
  from_email: process.env.EMAIL_FROM_ADDRESS!,
};

static readonly email: EmailConfig | undefined = process.env.EMAIL_PROVIDER ? {
  name: process.env.EMAIL_FROM_NAME!,
  from: process.env.EMAIL_FROM_ADDRESS!,
  provider: process.env.EMAIL_PROVIDER as 'plunk' | 'mailersend' | 'brevo' | 'smtp',
  plunk: { api_key: process.env.PLUNK_API_KEY! },
  mailersend: { api_key: process.env.MAILERSEND_API_KEY! },
  brevo: this.brevo,
  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    username: process.env.SMTP_USERNAME!,
    password: process.env.SMTP_PASSWORD!,
    secure: process.env.SMTP_SECURE === 'true',
  },
} : undefined;
```

## Unified EmailService

```ts
// services/email.ts
import 'server-only';
import { Config } from '@/lib/server/config';
import { BrevoService } from './brevo';
import { CustomSmtpService } from './smtp';
import { MailerSendService } from './mailersend';
import { PlunkService } from './plunk';

export interface SendEmailParams { to: string; subject: string; html: string; }

export class EmailService {
  static async send(params: SendEmailParams): Promise<void> {
    const config = Config.email;
    if (!config) throw new Error('Email configuration not set');
    if (config.provider === 'plunk') {
      await PlunkService.sendTransactional({ to: params.to, subject: params.subject, body: params.html, from: config.from });
    } else if (config.provider === 'mailersend') {
      await MailerSendService.sendEmail({ from: { email: config.from, name: config.name }, to: [{ email: params.to }], subject: params.subject, html: params.html });
    } else if (config.provider === 'brevo') {
      await BrevoService.send({ to: params.to, subject: params.subject, html: params.html });
    } else if (config.provider === 'smtp') {
      await CustomSmtpService.send({ to: params.to, subject: params.subject, html: params.html }, { host: config.smtp!.host, port: config.smtp!.port, username: config.smtp!.username, password: config.smtp!.password, secure: config.smtp!.secure, from_email: config.from, from_name: config.name });
    } else {
      throw new Error(`Unknown email provider: ${config.provider}`);
    }
  }
}
```

## Provider services

Each provider is a static class with a `send` method. See the source project for the full implementations:

- `PlunkService`: POST to `https://next-api.useplunk.com/v1/send` with `Authorization: Bearer`.
- `MailerSendService`: POST to `https://api.mailersend.com/v1/email` with `Authorization: Bearer`.
- `BrevoService`: nodemailer transport to `smtp-relay.brevo.com:587` with the Brevo SMTP user and API key.
- `CustomSmtpService`: nodemailer transport with user-provided host/port/credentials.

## OTP for email verification

```ts
// schemas/otp.schema.ts
export enum OtpPurpose { EMAIL_VERIFICATION = 'email_verification', TWO_FACTOR = 'two_factor' }
export interface IOtp extends Document { email: string; otp: string; purpose: OtpPurpose; expires_at: Date; is_used: boolean; }

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: Object.values(OtpPurpose), required: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
  is_used: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
```

The signup controller generates a 6-digit OTP, stores it with a 10-minute expiry, emails it, then verifies it on signup. The `expires: 0` TTL index auto-deletes expired OTPs.

## Usage

```ts
await EmailService.send({
  to: 'user@example.com',
  subject: 'Email verification',
  html: `<p>Your code is <strong>${otp}</strong>. Expires in 10 minutes.</p>`,
});
```

## Rules

- `EmailService.send` is the single entry point. Controllers call it, never the provider services directly.
- All email is server-side (`server-only`). No email sending from client components.
- The `from` address comes from `Config.email.from`, not from the caller. Consistent sender.
- OTP is 6 digits, 10-minute expiry, one-time use. Delete or mark `is_used` after verification.
- The TTL index on `expires_at` auto-cleans expired OTPs. No manual cleanup needed.

## Checklist

- [ ] `lib/server/config.ts` extended with `Config.email` and provider configs
- [ ] `services/email.ts` and the chosen provider service created
- [ ] `schemas/otp.schema.ts` created (if using email verification)
- [ ] `.env.local` has `EMAIL_PROVIDER`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, and the provider-specific keys
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created