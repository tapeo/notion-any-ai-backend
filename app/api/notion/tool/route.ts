import { callTool } from "@/lib/server/notion-tools";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { access_token?: string; name?: string; arguments?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const accessToken = body.access_token;
  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json(
      { error: "Missing required field: access_token" },
      { status: 400 },
    );
  }
  const name = body.name;
  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Missing required field: name" },
      { status: 400 },
    );
  }
  const args = body.arguments;
  if (!args || typeof args !== "object") {
    return NextResponse.json(
      { error: "Missing required field: arguments" },
      { status: 400 },
    );
  }

  const result = await callTool(accessToken, name, args as Record<string, unknown>);
  return NextResponse.json(result);
}