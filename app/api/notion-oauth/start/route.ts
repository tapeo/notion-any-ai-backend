import { startAuth } from "@/lib/server/notion-oauth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await startAuth();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start OAuth flow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}