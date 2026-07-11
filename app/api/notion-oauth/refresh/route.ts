import {
  NotionOAuthError,
  refreshAccessToken,
} from "@/lib/server/notion-oauth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { refresh_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const refreshToken = body.refresh_token;
  if (!refreshToken || typeof refreshToken !== "string") {
    return NextResponse.json(
      { error: "Missing required field: refresh_token" },
      { status: 400 },
    );
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    return NextResponse.json(tokens);
  } catch (err) {
    if (err instanceof NotionOAuthError) {
      const status = err.code === "reauth_required" ? 401 : 400;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    const message = err instanceof Error ? err.message : "Token refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}