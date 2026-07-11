import type { ApiResponse } from "./types";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export async function get(
  accessToken: string,
  path: string,
  params?: Record<string, string>,
): Promise<ApiResponse> {
  const url = new URL(`${NOTION_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url, { headers: headers(accessToken) });
  const body = await res.text();
  return { success: res.ok, status: res.status, body };
}

export async function post(
  accessToken: string,
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResponse> {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    method: "POST",
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { success: res.ok, status: res.status, body: text };
}

export async function patch(
  accessToken: string,
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResponse> {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    method: "PATCH",
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { success: res.ok, status: res.status, body: text };
}

export async function del(
  accessToken: string,
  path: string,
): Promise<ApiResponse> {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    method: "DELETE",
    headers: headers(accessToken),
  });
  const text = await res.text();
  return { success: res.ok, status: res.status, body: text };
}