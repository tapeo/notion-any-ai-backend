# Password reset

## Forgot password

```ts
// controllers/password.controller.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';
import { Config } from '@/lib/server/config';
import { UserSchema } from '@/schemas/user.schema';
import { EmailService } from '@/services/email';
import { validatePassword } from '@/lib/server/password-validator';

export class PasswordController {
  static handleForgotPasswordRequest = async (req: Request): Promise<NextResponse> => {
    try {
      const { email } = await req.json();
      const sanitized = email.trim().toLowerCase();
      const user = await UserSchema.findOne({ email: sanitized });
      // Always return success to avoid leaking which emails exist.
      if (!user) {
        return NextResponse.json({ status: 'success', message: 'If the email exists, a reset link has been sent' });
      }

      const token = crypto.randomBytes(20).toString('hex');
      user.reset_password_token = token;
      user.reset_password_expires = DateTime.now().plus({ hours: 1 }).toISO();
      await user.save();

      const resetUrl = `https://${Config.app.domain}/auth/password/reset?token=${token}`;
      await EmailService.send({
        to: user.email,
        subject: 'Password reset request',
        html: `<p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 1 hour.</p>`,
      });

      return NextResponse.json({ status: 'success', message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };
}
```

## Reset password

```ts
  static handleResetPasswordRequest = async (req: Request): Promise<NextResponse> => {
    try {
      const formData = await req.formData();
      const token = formData.get('token') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirm_password') as string;

      const user = await UserSchema.findOne({
        reset_password_token: token,
        reset_password_expires: { $gt: new Date() },
      });
      if (!user) {
        return NextResponse.json({ status: 'error', message: 'Token is invalid or has expired' }, { status: 400 });
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ status: 'error', message: 'Passwords do not match' }, { status: 400 });
      }
      const validation = validatePassword(password);
      if (!validation.valid) {
        return NextResponse.json({ status: 'error', message: validation.errors.join(', ') }, { status: 400 });
      }

      user.password = await bcrypt.hash(password, 10);
      user.reset_password_token = null;
      user.reset_password_expires = null;
      await user.save();

      return NextResponse.json({ status: 'success', message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
  };
```

## Password validator

```ts
// lib/server/password-validator.ts
export interface PasswordValidationResult { valid: boolean; errors: string[]; }

export function validatePassword(password: string, minLength = 8): PasswordValidationResult {
  const errors: string[] = [];
  if (!password) return { valid: false, errors: ['Password is required'] };
  if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`);
  return { valid: errors.length === 0, errors };
}
```

## Routes

```ts
// app/api/auth/password/forgot/route.ts
export const POST = withDB(async (req: Request) => PasswordController.handleForgotPasswordRequest(req));

// app/api/auth/password/reset/route.ts
export const POST = withDB(async (req: Request) => PasswordController.handleResetPasswordRequest(req));
```

Both are in `PUBLIC_API_PREFIXES` (under `/api/auth/password`).

## Reset form

The reset form is a client component that POSTs form data to `/api/auth/password/reset`. On success, navigate to `/auth/password/reset-success`.

```tsx
// app/auth/password/reset/route.ts (serve the HTML form)
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public/reset-password.html');
  try {
    const buffer = await fs.promises.readFile(filePath);
    return new NextResponse(buffer, { headers: { 'Content-Type': 'text/html' } });
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }
}
```

Alternatively, render a React page at `app/auth/password/reset/page.tsx` that reads `?token=` from search params and renders the form. The form submits via `fetch` to the API route.

## Rules

- Always return the same success message for forgot-password, regardless of whether the email exists. Prevents email enumeration.
- Token expiry: 1 hour. Store as ISO string, query with `{ $gt: new Date() }`.
- Clear `reset_password_token` and `reset_password_expires` after a successful reset.
- Use `bcrypt.hash(password, 10)`.
- The reset endpoint accepts form data (`application/x-www-form-urlencoded` or `multipart/form-data`), not JSON, because it is linked from an email and submitted as a form POST.