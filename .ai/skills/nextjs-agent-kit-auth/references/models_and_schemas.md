# Models and schemas

## User model

```ts
// model/user.ts
import { type BaseUser } from './base-user';

export interface User extends BaseUser {
  // Add app-specific user fields here.
}
```

```ts
// model/base-user.ts
export interface LlmSettings {
  use_custom_endpoint: boolean;
  custom_endpoint?: string;
  custom_api_key?: string;
  custom_model?: string;
}

export interface BaseUser {
  _id?: string;
  email: string;
  apple_user_id?: string | null;
  name?: string | null;
  password: string;
  picture_url: string | null;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  refresh_tokens: RefreshToken[];
  is_anonymous?: boolean;
  last_access?: string;
  created_at?: string;
  updated_at?: string;
  subscription_status?: string;
  push_notifications_token?: string;
  llm_settings?: LlmSettings;
}
```

## User schema

```ts
// schemas/user.schema.ts
import { User } from '@/model/user';
import { Model, Schema, model, models } from 'mongoose';

const userSchema = new Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, default: null },
  picture_url: { type: String, default: null },
  reset_password_token: { type: String },
  reset_password_expires: { type: Date },
  refresh_tokens: [RefreshTokenSchema],
  is_anonymous: { type: Boolean, default: false },
  last_access: { type: Date, default: null },
  push_notifications_token: { type: String, default: null },
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

userSchema.index({ email: 1 }, { unique: true });

const UserSchema = (models.User as Model<User>) || model<User>('User', userSchema);
export default UserSchema;
```

## RefreshToken sub-schema

```ts
// model/refresh-token.ts
export interface RefreshToken {
  expires_at: Date;
  encrypted_jwt: string;
}
```

```ts
const RefreshTokenSchema = new Schema<RefreshToken>({
  expires_at: { type: Date, required: true },
  encrypted_jwt: { type: String, required: true },
});
```

## OTP schema (optional, for email verification)

```ts
// schemas/otp.schema.ts
export enum OtpPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR = 'two_factor',
}

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  expires_at: Date;
  is_used: boolean;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: Object.values(OtpPurpose), required: true },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
  is_used: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

otpSchema.index({ email: 1, purpose: 1 });
```

## AuthResult envelope

```ts
// model/auth.ts
export interface AuthResult<T = undefined> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: T;
}

export interface LoginResultData {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface SignupResultData {
  id: string;
  merged_anonymous?: boolean;
  access_token?: string;
  refresh_token?: string;
}

export interface TokenRefreshResultData {
  access_token: string;
  refresh_token: string;
}
```

## Rules

- Backend interface fields are snake_case, matching the Mongoose schema.
- `_id` is `string` on the frontend DTO, `Types.ObjectId` on the backend when needed. For the User model used in API responses, keep `_id?: string` and convert with `user._id.toString()` in the controller.
- `password` is always excluded from API responses via `.select('-password -refresh_tokens')`.
- Refresh tokens are encrypted at rest, never returned to the client in the `me` response.