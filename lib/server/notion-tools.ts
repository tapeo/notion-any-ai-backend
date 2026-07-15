import { del, get, patch, post } from "./notion-client";
import { renderToMarkdown } from "./notion-markdown";
import type { ApiResponse, NotionToolResult } from "./types";

export async function callTool(
  accessToken: string,
  name: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  try {
    switch (name) {
      case "notion_search":
        return await search(accessToken, args);
      case "notion_fetch_page":
        return await fetchPage(accessToken, args);
      case "notion_get_blocks":
        return await getBlocks(accessToken, args);
      case "notion_get_block":
        return await getBlock(accessToken, args);
      case "notion_get_page_property":
        return await getPageProperty(accessToken, args);
      case "notion_get_page_markdown":
        return await getPageMarkdown(accessToken, args);
      case "notion_update_page_markdown":
        return await updatePageMarkdown(accessToken, args);
      case "notion_get_comments":
        return await getComments(accessToken, args);
      case "notion_get_users":
        return await getUsers(accessToken, args);
      case "notion_get_database":
        return await getDatabase(accessToken, args);
      case "notion_fetch_database":
        return await fetchDatabase(accessToken, args);
      case "notion_create_database":
        return await createDatabase(accessToken, args);
      case "notion_update_database":
        return await updateDatabase(accessToken, args);
      case "notion_query_database":
        return await queryDatabase(accessToken, args);
      case "notion_list_views":
        return await listViews(accessToken, args);
      case "notion_get_view_query_results":
        return await getViewQueryResults(accessToken, args);
      case "notion_create_page":
        return await createPage(accessToken, args);
      case "notion_update_page":
        return await updatePage(accessToken, args);
      case "notion_move_page":
        return await movePage(accessToken, args);
      case "notion_append_blocks":
        return await appendBlocks(accessToken, args);
      case "notion_update_block":
        return await updateBlock(accessToken, args);
      case "notion_delete_block":
        return await deleteBlock(accessToken, args);
      case "notion_archive_page":
        return await archivePage(accessToken, args);
      default:
        return { content: `Unknown tool: ${name}`, is_error: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: `Tool error: ${message}`, is_error: true };
  }
}

async function search(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const body: Record<string, unknown> = {};
  const query = args.query as string | undefined;
  if (query && query.length > 0) {
    body.query = query;
  }
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) body.page_size = pageSize;
  const cursor = args.start_cursor as string | undefined;
  if (cursor) body.start_cursor = cursor;
  const filter = args.filter;
  if (typeof filter === "string") {
    const value = filter === "database" ? "data_source" : filter;
    body.filter = { property: "object", value };
  } else if (filter && typeof filter === "object") {
    body.filter = filter;
  }
  const sortObj = args.sort;
  if (sortObj && typeof sortObj === "object") {
    body.sort = sortObj;
  }
  const res = await post(accessToken, "/search", body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function fetchPage(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_fetch_page");
  }
  const res = await get(accessToken, `/pages/${pageId}`);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getBlocks(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_get_blocks");
  }
  const asMarkdown = (args.as_markdown as boolean) ?? true;
  if (asMarkdown) {
    const markdown = await renderToMarkdown(accessToken, blockId);
    return {
      content: markdown.length === 0 ? "(empty page)" : markdown,
      is_error: false,
    };
  }
  const params: Record<string, string> = {};
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) params.page_size = String(pageSize);
  const cursor = args.start_cursor as string | undefined;
  if (cursor) params.start_cursor = cursor;
  const res = await get(accessToken, `/blocks/${blockId}/children`, params);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getBlock(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_get_block");
  }
  const res = await get(accessToken, `/blocks/${blockId}`);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getPageProperty(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_get_page_property");
  }
  const propertyId = args.property_id as string | undefined;
  if (!propertyId || propertyId.length === 0) {
    return missingParam("property_id", "notion_get_page_property");
  }
  const params: Record<string, string> = {};
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) params.page_size = String(pageSize);
  const cursor = args.start_cursor as string | undefined;
  if (cursor) params.start_cursor = cursor;
  const res = await get(
    accessToken,
    `/pages/${pageId}/properties/${propertyId}`,
    params,
  );
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getPageMarkdown(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_get_page_markdown");
  }
  const params: Record<string, string> = {};
  const includeTranscript = args.include_transcript as boolean | undefined;
  if (includeTranscript !== undefined) {
    params.include_transcript = String(includeTranscript);
  }
  const res = await get(accessToken, `/pages/${pageId}/markdown`, params);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function updatePageMarkdown(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_update_page_markdown");
  }
  const markdown = args.markdown as string | undefined;
  if (typeof markdown !== "string") {
    return missingParam("markdown", "notion_update_page_markdown");
  }
  const body: Record<string, unknown> = { markdown };
  const mode = args.mode as string | undefined;
  if (mode) body.mode = mode;
  const position = args.position;
  if (position && typeof position === "object") body.position = position;
  const res = await patch(accessToken, `/pages/${pageId}/markdown`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getComments(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_get_comments");
  }
  const params: Record<string, string> = { block_id: blockId };
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) params.page_size = String(pageSize);
  const cursor = args.start_cursor as string | undefined;
  if (cursor) params.start_cursor = cursor;
  const res = await get(accessToken, "/comments", params);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getUsers(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const params: Record<string, string> = {};
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) params.page_size = String(pageSize);
  const cursor = args.start_cursor as string | undefined;
  if (cursor) params.start_cursor = cursor;
  const res = await get(accessToken, "/users", params);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getDatabase(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const resolved = await resolveDataSourceId(accessToken, args, "notion_get_database");
  if ("error" in resolved) return resolved.error;
  const res = await get(accessToken, `/data_sources/${resolved.data_source_id}`);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function fetchDatabase(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const databaseId = args.database_id as string | undefined;
  if (!databaseId || databaseId.length === 0) {
    return missingParam("database_id", "notion_fetch_database");
  }
  const res = await get(accessToken, `/databases/${databaseId}`);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function queryDatabase(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const resolved = await resolveDataSourceId(accessToken, args, "notion_query_database");
  if ("error" in resolved) return resolved.error;
  const body: Record<string, unknown> = {};
  const filter = args.filter;
  if (filter && typeof filter === "object") {
    body.filter = filter;
  }
  const sorts = args.sorts;
  if (Array.isArray(sorts)) body.sorts = sorts;
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) body.page_size = pageSize;
  const cursor = args.start_cursor as string | undefined;
  if (cursor) body.start_cursor = cursor;
  const isArchived = args.is_archived as boolean | undefined;
  if (isArchived !== undefined) body.is_archived = isArchived;
  const resultType = args.result_type as string | undefined;
  if (resultType) body.result_type = resultType;
  const filterProperties = args.filter_properties;
  const queryParams: Record<string, string> = {};
  if (Array.isArray(filterProperties)) {
    const path = `/data_sources/${resolved.data_source_id}/query`;
    const url = new URLSearchParams();
    for (const prop of filterProperties) {
      if (typeof prop === "string") url.append("filter_properties[]", prop);
    }
    const query = url.toString();
    const res = await post(
      accessToken,
      query.length > 0 ? `${path}?${query}` : path,
      body,
    );
    if (!res.success) return errorResponse(res);
    return { content: prettyJson(res.body), is_error: false };
  }
  const res = await post(
    accessToken,
    `/data_sources/${resolved.data_source_id}/query`,
    body,
  );
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function createPage(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const parent = args.parent;
  if (!parent || typeof parent !== "object") {
    return missingParam("parent", "notion_create_page");
  }
  const properties = args.properties;
  if (!properties || typeof properties !== "object") {
    return missingParam("properties", "notion_create_page");
  }
  const body: Record<string, unknown> = {
    parent,
    properties,
  };
  const children = args.children;
  if (Array.isArray(children)) body.children = children;
  const icon = args.icon;
  if (icon && typeof icon === "object") body.icon = icon;
  const cover = args.cover;
  if (cover && typeof cover === "object") body.cover = cover;
  const res = await post(accessToken, "/pages", body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function updatePage(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_update_page");
  }
  const body: Record<string, unknown> = {};
  const properties = args.properties;
  if (properties && typeof properties === "object") body.properties = properties;
  const icon = args.icon;
  if (icon && typeof icon === "object") body.icon = icon;
  const cover = args.cover;
  if (cover && typeof cover === "object") body.cover = cover;
  const archived = args.archived as boolean | undefined;
  if (archived !== undefined) body.archived = archived;
  const inTrash = args.in_trash as boolean | undefined;
  if (inTrash !== undefined) body.in_trash = inTrash;
  const res = await patch(accessToken, `/pages/${pageId}`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function appendBlocks(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_append_blocks");
  }
  const children = args.children;
  if (!Array.isArray(children)) {
    return missingParam("children", "notion_append_blocks");
  }
  const body: Record<string, unknown> = { children };
  const after = args.after as string | undefined;
  if (after) body.after = after;
  const res = await patch(accessToken, `/blocks/${blockId}/children`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function updateBlock(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_update_block");
  }
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    if (key !== "block_id") body[key] = value;
  }
  const res = await patch(accessToken, `/blocks/${blockId}`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function deleteBlock(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const blockId = args.block_id as string | undefined;
  if (!blockId || blockId.length === 0) {
    return missingParam("block_id", "notion_delete_block");
  }
  const res = await del(accessToken, `/blocks/${blockId}`);
  if (!res.success) return errorResponse(res);
  return { content: `Block ${blockId} deleted.`, is_error: false };
}

async function movePage(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_move_page");
  }
  const parent = args.parent;
  if (!parent || typeof parent !== "object") {
    return missingParam("parent", "notion_move_page");
  }
  const res = await post(accessToken, `/pages/${pageId}/move`, { parent });
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function createDatabase(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const parent = args.parent;
  if (!parent || typeof parent !== "object") {
    return missingParam("parent", "notion_create_database");
  }
  const title = args.title;
  if (!Array.isArray(title)) {
    return missingParam("title", "notion_create_database");
  }
  const properties = args.properties;
  if (!properties || typeof properties !== "object") {
    return missingParam("properties", "notion_create_database");
  }
  const body: Record<string, unknown> = { parent, title, properties };
  const icon = args.icon;
  if (icon && typeof icon === "object") body.icon = icon;
  const cover = args.cover;
  if (cover && typeof cover === "object") body.cover = cover;
  const description = args.description;
  if (Array.isArray(description)) body.description = description;
  const res = await post(accessToken, "/databases", body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function updateDatabase(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const databaseId = args.database_id as string | undefined;
  if (!databaseId || databaseId.length === 0) {
    return missingParam("database_id", "notion_update_database");
  }
  const body: Record<string, unknown> = {};
  const title = args.title;
  if (Array.isArray(title)) body.title = title;
  const description = args.description;
  if (Array.isArray(description)) body.description = description;
  const properties = args.properties;
  if (properties && typeof properties === "object") body.properties = properties;
  const icon = args.icon;
  if (icon && typeof icon === "object") body.icon = icon;
  const cover = args.cover;
  if (cover && typeof cover === "object") body.cover = cover;
  const res = await patch(accessToken, `/databases/${databaseId}`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function listViews(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const databaseId = args.database_id as string | undefined;
  const dataSourceId = args.data_source_id as string | undefined;
  if ((!databaseId || databaseId.length === 0) && (!dataSourceId || dataSourceId.length === 0)) {
    return missingParam("database_id or data_source_id", "notion_list_views");
  }
  const params: Record<string, string> = {};
  if (databaseId) params.database_id = databaseId;
  if (dataSourceId) params.data_source_id = dataSourceId;
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) params.page_size = String(pageSize);
  const cursor = args.start_cursor as string | undefined;
  if (cursor) params.start_cursor = cursor;
  const res = await get(accessToken, "/views", params);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function getViewQueryResults(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const viewId = args.view_id as string | undefined;
  if (!viewId || viewId.length === 0) {
    return missingParam("view_id", "notion_get_view_query_results");
  }
  const body: Record<string, unknown> = {};
  const pageSize = args.page_size as number | undefined;
  if (pageSize !== undefined) body.page_size = pageSize;
  const res = await post(accessToken, `/views/${viewId}/queries`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

async function archivePage(
  accessToken: string,
  args: Record<string, unknown>,
): Promise<NotionToolResult> {
  const pageId = args.page_id as string | undefined;
  if (!pageId || pageId.length === 0) {
    return missingParam("page_id", "notion_archive_page");
  }
  const archived = (args.archived as boolean) ?? true;
  const body: Record<string, unknown> = { archived };
  const res = await patch(accessToken, `/pages/${pageId}`, body);
  if (!res.success) return errorResponse(res);
  return { content: prettyJson(res.body), is_error: false };
}

type DataSourceIdResult =
  | { data_source_id: string }
  | { error: NotionToolResult };

async function resolveDataSourceId(
  accessToken: string,
  args: Record<string, unknown>,
  toolName: string,
): Promise<DataSourceIdResult> {
  const dataSourceId = args.data_source_id as string | undefined;
  if (dataSourceId && dataSourceId.length > 0) {
    return { data_source_id: dataSourceId };
  }
  const databaseId = args.database_id as string | undefined;
  if (!databaseId || databaseId.length === 0) {
    return {
      error: missingParam("database_id or data_source_id", toolName),
    };
  }
  const res = await get(accessToken, `/databases/${databaseId}`);
  if (!res.success) return { error: errorResponse(res) };
  let parsed: { data_sources?: Array<{ id: string; name?: string }> };
  try {
    parsed = JSON.parse(res.body);
  } catch {
    return { error: errorResponse(res) };
  }
  const sources = parsed.data_sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    return {
      error: {
        content: `Tool error: No data sources found for database ${databaseId}.`,
        is_error: true,
      },
    };
  }
  if (sources.length === 1) {
    return { data_source_id: sources[0].id };
  }
  const list = sources
    .map((s) => `- ${s.id}${s.name ? ` (${s.name})` : ""}`)
    .join("\n");
  return {
    error: {
      content: `Tool error: Database ${databaseId} has multiple data sources. Pass a 'data_source_id' explicitly. Available:\n${list}`,
      is_error: true,
    },
  };
}

function missingParam(param: string, toolName: string): NotionToolResult {
  return {
    content: `Tool error: Missing required parameter '${param}' for ${toolName}. Provide the missing parameter and retry.`,
    is_error: true,
  };
}

function errorResponse(res: ApiResponse): NotionToolResult {
  let message: string;
  try {
    const decoded = JSON.parse(res.body);
    if (decoded && typeof decoded === "object" && "message" in decoded) {
      message = (decoded as { message: string }).message;
    } else {
      message = res.body;
    }
  } catch {
    message = res.body;
  }
  return {
    content: `Notion API error (${res.status}): ${message}`,
    is_error: true,
  };
}

function prettyJson(data: string): string {
  try {
    const parsed = JSON.parse(data);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return data;
  }
}