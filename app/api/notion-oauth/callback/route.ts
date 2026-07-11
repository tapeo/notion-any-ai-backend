import {
  handleCallback,
  NotionOAuthError,
} from "@/lib/server/notion-oauth";
import { NextRequest, NextResponse } from "next/server";

const APP_SCHEME = "notionopenai";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlResponse(
  schemeUrl: string,
  title: string,
  message: string,
): NextResponse {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
</head>
<body>
<p>${escapeHtml(message)}</p>
<script>window.location.href = ${JSON.stringify(schemeUrl)};</script>
</body>
</html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function buildTokenResponse(tokens: {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: number;
  workspace_id: string | null;
  workspace_name: string | null;
  user_name: string | null;
  bot_id: string | null;
  connected_at: number;
}): NextResponse {
  const params = new URLSearchParams({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    access_token_expires_at: String(tokens.access_token_expires_at),
    workspace_id: tokens.workspace_id ?? "",
    workspace_name: tokens.workspace_name ?? "",
    user_name: tokens.user_name ?? "",
    bot_id: tokens.bot_id ?? "",
    connected_at: String(tokens.connected_at),
  });
  const schemeUrl = `${APP_SCHEME}://oauth/callback?${params.toString()}`;
  return buildHtmlResponse(
    schemeUrl,
    "Notion connected",
    "Notion connected. You can close this tab.",
  );
}

function buildErrorResponse(code: string, message: string): NextResponse {
  const params = new URLSearchParams({ error: code, message });
  const schemeUrl = `${APP_SCHEME}://oauth/callback?${params.toString()}`;
  return buildHtmlResponse(
    schemeUrl,
    "Notion connection failed",
    `Connection failed: ${message}. You can close this tab.`,
  );
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    return buildErrorResponse(errorParam, req.nextUrl.searchParams.get("message") ?? "");
  }
  if (!code || !state) {
    return buildErrorResponse("missing_code_or_state", "Missing code or state parameter");
  }

  try {
    const tokens = await handleCallback(state, code);
    return buildTokenResponse(tokens);
  } catch (err) {
    if (err instanceof NotionOAuthError) {
      return buildErrorResponse(err.code ?? "error", err.message);
    }
    const message = err instanceof Error ? err.message : "OAuth callback failed";
    return buildErrorResponse("error", message);
  }
}