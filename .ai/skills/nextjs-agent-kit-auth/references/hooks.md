# Auth hooks

## useUser (React Query)

```ts
// hooks/user.hook.ts
import { UserApi } from '@/lib/client/user-api';
import { useQuery } from '@tanstack/react-query';

export const userQueryKey = 'user-me';

export const useUser = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: [userQueryKey],
    queryFn: () => UserApi.getMe(),
  });
  return { user, isLoading };
};
```

## useAuth (actions)

`useAuth` returns action functions, not state. State comes from `useUser`. The actions call the API and reset queries or navigate.

```ts
// hooks/auth.hook.ts
import { UserApi } from '@/lib/client/user-api';
import { AuthApi } from '@/lib/client/auth-api';
import { client } from '@/lib/client/client';
import { Dialog } from '@/lib/client/dialog';
import { queryClient } from '@/lib/client/react-query';

export const useAuth = () => {
  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      await Dialog.alert({ title: 'Missing credentials', description: 'Email and password are required.' });
      return false;
    }
    try {
      const response = await fetch(`${client.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!response.ok) {
        await Dialog.alert({ title: 'Login failed', description: 'Please check your credentials and try again.' });
        return false;
      }
      queryClient.resetQueries();
      return true;
    } catch {
      await Dialog.alert({ title: 'Login failed', description: 'An unexpected error occurred. Please try again.' });
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      await Dialog.alert({ title: 'Missing fields', description: 'Email and password are required.' });
      return false;
    }
    const response = await fetch(`${client.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      await Dialog.alert({ title: 'Signup failed', description: data.message || 'Please try again.' });
      return false;
    }
    return login(email, password);
  };

  const logout = async () => {
    await client.logout();
  };

  const deleteAccount = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Delete account',
      description: 'This action is permanent and cannot be undone.',
      confirmText: 'Delete account',
      cancelText: 'Cancel',
      destructive: true,
    });
    if (!confirmed) return;
    await UserApi.deleteAccount();
    await logout();
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await AuthApi.forgotPassword(email);
      return true;
    } catch {
      return false;
    }
  };

  const resetPassword = async (formData: FormData): Promise<boolean> => {
    try {
      await AuthApi.resetPassword(formData);
      return true;
    } catch {
      return false;
    }
  };

  return { login, signup, logout, deleteAccount, forgotPassword, resetPassword };
};
```

## Usage in the app shell

```tsx
'use client';

import { useUser } from '@/hooks/user.hook';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading || !user) return null;
  return <Navbar>{user && children}</Navbar>;
}
```

The `useUser` hook drives the auth gate. While loading, render `null` (blank page). If `user` is null after loading, the `client.fetch` 401 handler will have redirected to `/auth`. Do not render a "not authenticated" state here, the redirect handles it.

## Usage in the auth page

```tsx
'use client';

import { useAuth } from '@/hooks/auth.hook';

export default function AuthPage() {
  const { login, signup } = useAuth();
  // ...
  const ok = await login(email, password);
  if (ok) window.location.href = '/app';
}
```

## Rules

- `useUser` is the single source of truth for the current user. Read it wherever you need the user object.
- Do not store the user in jotai or `useState`. React Query caches it.
- After login, call `queryClient.resetQueries()` to clear any stale anonymous data, then `window.location.href = '/app'` for a full reload.
- After logout, `client.logout()` clears storage and navigates to `/auth`. Do not call `queryClient.resetQueries()` manually, the reload handles it.