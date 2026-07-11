import { Config } from "../shared/config";
import type { NotionStartResult, NotionTokens } from "./types";

const NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize";
const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token";

const PENDING_MAX_MS = 10 * 60 * 1000;

export class NotionOAuthError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "NotionOAuthError";
  }
}

function basicAuthHeader(): string {
  const credentials = `${Config.notionClientId}:${Config.notionClientSecret}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

function generateState(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
    "hex",
  );
}

async function signStateJwt(userId: string, state: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    state,
    iat: now,
    exp: now + Math.floor(PENDING_MAX_MS / 1000),
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await cryptoSign(data);
  return `${data}.${signature}`;
}

async function cryptoSign(data: string): Promise<string> {
  const key = Config.notionOAuthStateSecret;
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(data),
  );
  return Buffer.from(new Uint8Array(signature)).toString("base64url");
}

async function verifyStateJwt(token: string): Promise<{ userId: string; state: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new NotionOAuthError("Invalid state token", "invalid_state");
  }
  const data = `${parts[0]}.${parts[1]}`;
  const expectedSignature = await cryptoSign(data);
  if (parts[2] !== expectedSignature) {
    throw new NotionOAuthError("Invalid state signature", "invalid_state");
  }
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  } catch {
    throw new NotionOAuthError("Malformed state payload", "invalid_state");
  }
  const userId = payload.sub;
  const state = payload.state;
  if (typeof userId !== "string" || typeof state !== "string") {
    throw new NotionOAuthError("Invalid state token", "invalid_state");
  }
  const exp = payload.exp;
  if (typeof exp === "number" && Date.now() / 1000 > exp) {
    throw new NotionOAuthError("State token expired", "invalid_state");
  }
  return { userId, state };
}

export async function startAuth(): Promise<NotionStartResult> {
  const state = generateState();
  const stateJwt = await signStateJwt("notion-app", state);
  const params = new URLSearchParams({
    client_id: Config.notionClientId,
    redirect_uri: Config.notionOAuthRedirectUri,
    response_type: "code",
    owner: "user",
    state: stateJwt,
  });
  const authorizationUrl = `${NOTION_AUTH_URL}?${params.toString()}`;
  return { authorization_url: authorizationUrl };
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  workspace_id?: string;
  workspace_name?: string;
  workspace_icon?: string;
  bot_id?: string;
  owner?: {
    type?: string;
    user?: {
      id?: string;
      name?: string;
    };
  };
}

function parseTokenResponse(data: TokenResponse): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  workspaceId: string | null;
  workspaceName: string | null;
  userName: string | null;
  botId: string | null;
} {
  if (!data.access_token) {
    throw new NotionOAuthError("Token response missing access_token");
  }
  let ownerName: string | null = null;
  if (data.owner && data.owner.user) {
    ownerName = data.owner.user.name ?? null;
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : 3600,
    workspaceId: data.workspace_id ?? null,
    workspaceName: data.workspace_name ?? null,
    userName: ownerName,
    botId: data.bot_id ?? null,
  };
}

export async function handleCallback(
  stateJwt: string,
  code: string,
): Promise<NotionTokens> {
  let verified: { userId: string; state: string };
  try {
    verified = await verifyStateJwt(stateJwt);
  } catch {
    throw new NotionOAuthError("Invalid or expired state", "invalid_state");
  }
  void verified;

  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: Config.notionOAuthRedirectUri,
  };

  const res = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let errCode: string | undefined;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      errCode = parsed.error;
    } catch {
      // not JSON
    }
    throw new NotionOAuthError(
      `Token exchange failed: ${res.status} ${text}`,
      errCode,
    );
  }

  const data = (await res.json()) as TokenResponse;
  const parsed = parseTokenResponse(data);
  const now = Date.now();

  return {
    access_token: parsed.accessToken,
    refresh_token: parsed.refreshToken,
    access_token_expires_at: now + parsed.expiresIn * 1000,
    workspace_id: parsed.workspaceId,
    workspace_name: parsed.workspaceName,
    user_name: parsed.userName,
    bot_id: parsed.botId,
    connected_at: now,
  };
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<NotionTokens> {
  const body = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  const res = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let errCode: string | undefined;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      errCode = parsed.error;
    } catch {
      // not JSON
    }
    if (errCode === "invalid_grant") {
      throw new NotionOAuthError("Re-authentication required", "reauth_required");
    }
    throw new NotionOAuthError(
      `Token refresh failed: ${res.status} ${text}`,
      errCode,
    );
  }

  const data = (await res.json()) as TokenResponse;
  const parsed = parseTokenResponse(data);
  const now = Date.now();

  return {
    access_token: parsed.accessToken,
    refresh_token: parsed.refreshToken,
    access_token_expires_at: now + parsed.expiresIn * 1000,
    workspace_id: parsed.workspaceId,
    workspace_name: parsed.workspaceName,
    user_name: parsed.userName,
    bot_id: parsed.botId,
    connected_at: now,
  };
}