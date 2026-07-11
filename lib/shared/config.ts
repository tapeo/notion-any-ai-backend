function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const Config = {
  get notionClientId(): string {
    return required("NOTION_CLIENT_ID");
  },
  get notionClientSecret(): string {
    return required("NOTION_CLIENT_SECRET");
  },
  get notionOAuthRedirectUri(): string {
    return required("NOTION_OAUTH_REDIRECT_URI");
  },
  get notionOAuthStateSecret(): string {
    return required("NOTION_OAUTH_STATE_SECRET");
  },
} as const;