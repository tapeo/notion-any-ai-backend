import { get } from "./notion-client";

interface NotionBlock {
  id?: string;
  type?: string;
  has_children?: boolean;
  [key: string]: unknown;
}

export async function renderToMarkdown(
  accessToken: string,
  blockId: string,
): Promise<string> {
  const buffer: string[] = [];
  await renderChildren(accessToken, blockId, buffer, "");
  return buffer.join("\n").trim();
}

async function renderChildren(
  accessToken: string,
  blockId: string,
  buffer: string[],
  indent: string,
): Promise<void> {
  let cursor: string | null = null;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) {
      url.searchParams.set("start_cursor", cursor);
    }
    const res = await get(accessToken, `/blocks/${blockId}/children`, {
      page_size: "100",
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    if (!res.success) {
      buffer.push(`${indent}[Failed to load blocks: ${res.status}]`);
      return;
    }
    const data = JSON.parse(res.body) as {
      results?: NotionBlock[];
      has_more?: boolean;
      next_cursor?: string;
    };
    const results = data.results ?? [];
    for (const block of results) {
      const line = renderBlock(block, indent);
      if (line.length > 0) {
        buffer.push(line);
      }
      if (block.has_children && block.id) {
        buffer.push("");
        await renderChildren(accessToken, block.id, buffer, `${indent}  `);
        buffer.push("");
      }
    }
    cursor = data.has_more ? (data.next_cursor ?? null) : null;
  } while (cursor !== null);
}

function renderBlock(block: NotionBlock, indent: string): string {
  const type = block.type ?? "";
  const content = (block[type] as Record<string, unknown> | undefined) ?? {};
  switch (type) {
    case "paragraph":
      return `${indent}${renderRichText(content.rich_text)}`;
    case "heading_1":
      return `${indent}# ${renderRichText(content.rich_text)}`;
    case "heading_2":
      return `${indent}## ${renderRichText(content.rich_text)}`;
    case "heading_3":
      return `${indent}### ${renderRichText(content.rich_text)}`;
    case "bulleted_list_item":
      return `${indent}- ${renderRichText(content.rich_text)}`;
    case "numbered_list_item":
      return `${indent}1. ${renderRichText(content.rich_text)}`;
    case "to_do": {
      const checked = (content.checked as boolean) ?? false;
      return `${indent}- [${checked ? "x" : " "}] ${renderRichText(content.rich_text)}`;
    }
    case "toggle":
      return `${indent}<details><summary>${renderRichText(content.rich_text)}</summary>`;
    case "code": {
      const language = (content.language as string) ?? "";
      const code = renderRichText(content.rich_text);
      return `${indent}\`\`\`${language}\n${code}\n${indent}\`\`\``;
    }
    case "quote":
      return `${indent}> ${renderRichText(content.rich_text)}`;
    case "callout": {
      const icon = content.icon as Record<string, unknown> | undefined;
      const emoji = (icon?.emoji as string) ?? "";
      return `${indent}> ${emoji} ${renderRichText(content.rich_text)}`;
    }
    case "divider":
      return `${indent}---`;
    case "image": {
      const caption = renderRichText(content.caption);
      const url = extractFileUrl(content);
      if (!url) return "";
      return `${indent}![${caption.length === 0 ? "image" : caption}](${url})`;
    }
    case "bookmark": {
      const url = (content.url as string) ?? "";
      const caption = renderRichText(content.caption);
      return `${indent}[${caption.length === 0 ? url : caption}](${url})`;
    }
    case "embed": {
      const url = (content.url as string) ?? "";
      return `${indent}[embed](${url})`;
    }
    case "link_preview": {
      const url = (content.url as string) ?? "";
      return `${indent}[link preview](${url})`;
    }
    case "video": {
      const url = extractFileUrl(content);
      if (!url) return "";
      return `${indent}[video](${url})`;
    }
    case "audio": {
      const url = extractFileUrl(content);
      if (!url) return "";
      return `${indent}[audio](${url})`;
    }
    case "pdf": {
      const url = extractFileUrl(content);
      if (!url) return "";
      return `${indent}[pdf](${url})`;
    }
    case "table":
      return `${indent}[table]`;
    case "table_row": {
      const cells = (content.cells as unknown[]) ?? [];
      const cellTexts: string[] = [];
      for (const cell of cells) {
        if (Array.isArray(cell)) {
          cellTexts.push(renderRichTextList(cell as Record<string, unknown>[]));
        }
      }
      return `${indent}| ${cellTexts.join(" | ")} |`;
    }
    case "column_list":
    case "column":
      return "";
    case "synced_block":
      return "";
    default:
      return "";
  }
}

function renderRichText(richTextField: unknown): string {
  if (!Array.isArray(richTextField)) return "";
  return renderRichTextList(richTextField as Record<string, unknown>[]);
}

function renderRichTextList(list: Record<string, unknown>[]): string {
  const parts: string[] = [];
  for (const item of list) {
    parts.push(renderRichTextItem(item));
  }
  return parts.join("");
}

function renderRichTextItem(item: Record<string, unknown>): string {
  const type = (item.type as string) ?? "text";
  if (type === "mention") {
    const mention = item.mention as Record<string, unknown> | undefined;
    if (mention) {
      const mentionType = mention.type as string | undefined;
      if (mentionType === "page") {
        const page = mention.page as Record<string, unknown> | undefined;
        const pageId = page?.id as string | undefined;
        if (pageId) return `[page: ${pageId}]`;
      }
      if (mentionType === "user") {
        const user = mention.user as Record<string, unknown> | undefined;
        const name = user?.name as string | undefined;
        if (name) return `@${name}`;
      }
      if (mentionType === "database") {
        const db = mention.database as Record<string, unknown> | undefined;
        const dbId = db?.id as string | undefined;
        if (dbId) return `[database: ${dbId}]`;
      }
    }
    return "";
  }
  if (type === "equation") {
    const equation = item.equation as Record<string, unknown> | undefined;
    const expression = equation?.expression as string | undefined;
    return expression ? `$$${expression}$$` : "";
  }
  const text = (item.plain_text as string) ?? "";
  if (text.length === 0) return "";
  const href = item.href as string | undefined;
  const annotations = item.annotations as Record<string, unknown> | undefined;
  let rendered = text;
  if (annotations) {
    if (annotations.code === true) {
      rendered = `\`${rendered}\``;
    }
    if (annotations.bold === true) {
      rendered = `**${rendered}**`;
    }
    if (annotations.italic === true) {
      rendered = `*${rendered}*`;
    }
    if (annotations.strikethrough === true) {
      rendered = `~~${rendered}~~`;
    }
  }
  if (href && href.length > 0) {
    rendered = `[${rendered}](${href})`;
  }
  return rendered;
}

function extractFileUrl(content: Record<string, unknown>): string | null {
  const fileType = content.type as string | undefined;
  if (fileType === "external") {
    const external = content.external as Record<string, unknown> | undefined;
    return (external?.url as string) ?? null;
  }
  if (fileType === "file") {
    const file = content.file as Record<string, unknown> | undefined;
    return (file?.url as string) ?? null;
  }
  return null;
}