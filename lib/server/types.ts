export interface NotionToolResult {
  content: string;
  is_error: boolean;
}

export interface NotionSelfInfo {
  workspace_id: string | null;
  workspace_name: string | null;
  user_name: string | null;
}

export interface NotionTokens {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: number;
  workspace_id: string | null;
  workspace_name: string | null;
  user_name: string | null;
  bot_id: string | null;
  connected_at: number;
}

export interface NotionStartResult {
  authorization_url: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  body: string;
}

export type { ApiResponse };