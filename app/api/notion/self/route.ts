import { get } from "@/lib/server/notion-client";
import type { NotionSelfInfo } from "@/lib/server/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization Bearer token" },
      { status: 401 },
    );
  }
  const accessToken = authHeader.slice("Bearer ".length);

  const res = await get(accessToken, "/users/me");
  if (!res.success) {
    return NextResponse.json(
      { error: `Notion API error (${res.status}): ${res.body}` },
      { status: res.status },
    );
  }

  const data = JSON.parse(res.body) as {
    name?: string;
    bot?: {
      workspace_name?: string;
      workspace_id?: string;
    };
  };
  const info: NotionSelfInfo = {
    workspace_id: data.bot?.workspace_id ?? null,
    workspace_name: data.bot?.workspace_name ?? null,
    user_name: data.name ?? null,
  };
  return NextResponse.json(info);
}