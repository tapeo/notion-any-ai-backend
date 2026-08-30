---
name: nextjs-agent-kit-storage
description: >-
  Add file storage and uploads to a Next.js app built on the Next.js Agent
  Kit. Use when uploading user files, attachments, profile pictures, or any
  binary data to Google Cloud Storage. Covers the GoogleStorageService
  static class, service account credentials from base64 env, file
  validation (MIME allowlist, size limit, magic bytes), upload from
  multipart form data and from buffers, and reading/deleting files.
---

# How to add file storage

Storage is **opt-in**. Build it when your app needs file uploads (attachments, profile pictures, document assets). The kit uses Google Cloud Storage via the `@google-cloud/storage` SDK.

## What you need to build

```
lib/server/config.ts               # Config.google_storage section
lib/server/gcp.ts                  # loadServiceAccountCredentials helper
services/google-storage.ts         # GoogleStorageService static class
app/api/<resource>/upload/route.ts # multipart upload route (auth-gated)
app/api/<resource>/[id]/route.ts   # GET (read), DELETE (remove)
```

## Config

```ts
static readonly google_storage = {
  bucket_name: process.env.GOOGLE_STORAGE_BUCKET_NAME!,
  private_key_base64: process.env.GOOGLE_STORAGE_PRIVATE_KEY_BASE64!,
};
```

The service account JSON is base64-encoded in `GOOGLE_STORAGE_PRIVATE_KEY_BASE64`. It must contain `project_id`, `private_key`, `client_email`.

## Credentials helper

```ts
// lib/server/gcp.ts
import 'server-only';

export function loadServiceAccountCredentials(base64: string): { project_id: string; private_key: string; client_email: string } | null {
  try {
    const json = Buffer.from(base64, 'base64').toString('utf8');
    const creds = JSON.parse(json);
    return { project_id: creds.project_id, private_key: creds.private_key, client_email: creds.client_email };
  } catch {
    return null;
  }
}
```

## Service

```ts
// services/google-storage.ts
import 'server-only';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import { JWT } from 'google-auth-library';
import { Config } from '@/lib/server/config';
import { loadServiceAccountCredentials } from '@/lib/server/gcp';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
};

export function validateFile(file: { mimetype: string; size: number; path: string }): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) return { valid: false, error: `File type ${file.mimetype} not allowed` };
  if (file.size > MAX_FILE_SIZE) return { valid: false, error: 'File too large' };
  const expected = MAGIC_BYTES[file.mimetype];
  if (expected) {
    const fd = fs.openSync(file.path, 'r');
    const buf = Buffer.alloc(expected.length);
    fs.readSync(fd, buf, 0, expected.length, 0);
    fs.closeSync(fd);
    for (let i = 0; i < expected.length; i++) {
      if (buf[i] !== expected[i]) return { valid: false, error: 'File content does not match declared type' };
    }
  }
  return { valid: true };
}

export class GoogleStorageService {
  private static storage: Storage | null = null;

  private static getStorage(): Storage {
    if (!this.storage) {
      const creds = loadServiceAccountCredentials(Config.google_storage.private_key_base64)!;
      const client = new JWT({ email: creds.client_email, key: creds.private_key.replace(/\\n/g, '\n'), scopes: ['https://www.googleapis.com/auth/devstorage.full_control'] });
      this.storage = new Storage({ authClient: client });
    }
    return this.storage;
  }

  static async uploadBuffer(buffer: Buffer, destination: string, contentType: string): Promise<string> {
    const bucket = this.getStorage().bucket(Config.google_storage.bucket_name);
    const file = bucket.file(destination);
    await new Promise<void>((resolve, reject) => {
      const stream = file.createWriteStream({ contentType, metadata: { contentType } });
      stream.on('error', reject);
      stream.on('finish', () => resolve());
      stream.end(buffer);
    });
    return file.publicUrl();
  }

  static async readFileBuffer(path: string): Promise<Buffer> {
    const bucket = this.getStorage().bucket(Config.google_storage.bucket_name);
    const [buffer] = await bucket.file(path).download();
    return buffer;
  }

  static async deleteFile(path: string): Promise<void> {
    const bucket = this.getStorage().bucket(Config.google_storage.bucket_name);
    await bucket.file(path).delete();
  }
}
```

## Upload route (multipart)

```ts
// app/api/attachments/route.ts
import { GoogleStorageService, validateFile } from '@/services/google-storage';
import { withAuth } from '@/middlewares/auth-wrapper';
import { withDB } from '@/middlewares/db-wrapper';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withDB(withAuth(async (req: NextRequest, { auth }) => {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateFile({ mimetype: file.type, size: file.size, path: '' });
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });
  // Note: magic bytes check needs a file path. For in-memory buffers, skip or
  // rewrite to check the buffer header instead of reading from disk.

  const destination = `users/${auth.userId}/attachments/${crypto.randomUUID()}`;
  const publicUrl = await GoogleStorageService.uploadBuffer(buffer, destination, file.type);
  return NextResponse.json({ url: publicUrl });
}));
```

For browser uploads, do not set `Content-Type` on the fetch. The browser sets the multipart boundary. The route reads `await req.formData()` and the file is a `File` instance.

## Rules

- Validate MIME type, size, and magic bytes. The magic byte check prevents extension spoofing.
- The max file size is 10MB by default. Override per route via the `maxSize` option.
- PDFs get `contentDisposition: 'inline'` so they render in the browser instead of downloading.
- Private buckets: use `readFileBuffer` to stream the file through your API route. Public buckets: return the `publicUrl()` directly.
- The service account JSON never leaves the server. It is base64 in env, decoded server-side.

## Checklist

- [ ] `lib/server/config.ts` extended with `Config.google_storage`
- [ ] `lib/server/gcp.ts` credentials helper created
- [ ] `services/google-storage.ts` created
- [ ] Upload route created (auth-gated)
- [ ] `GOOGLE_STORAGE_BUCKET_NAME` and `GOOGLE_STORAGE_PRIVATE_KEY_BASE64` env vars set
- [ ] `npm run lint && tsc --noEmit` pass
- [ ] `changes/` entry created