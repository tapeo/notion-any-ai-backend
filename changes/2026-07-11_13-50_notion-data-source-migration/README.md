# notion data source migration (2025-09-03+)

## context

Notion API version `2025-09-03` split databases and data sources. The backend
uses `Notion-Version: 2026-03-11` (`lib/server/notion-client.ts:4`), so the old
`/databases/{database_id}/query` endpoint returns `400 Invalid request URL`.
The deprecated endpoint was replaced by `/data_sources/{data_source_id}/query`.

## changes

### `lib/server/notion-tools.ts`

1. **`queryDatabase`**: now POSTs to `/data_sources/{data_source_id}/query`
   instead of `/databases/{database_id}/query`. Accepts either `data_source_id`
   (used directly) or `database_id` (resolved via the discovery step). Forwards
   the new optional `is_archived` and `result_type` body params.

2. **`getDatabase`**: now GETs `/data_sources/{data_source_id}` to return the
   data source schema. Accepts either `data_source_id` or `database_id` (same
   discovery step).

3. **`search`**: maps the old `filter` value `"database"` to `"data_source"`
   so existing callers keep working under `2026-03-11`.

4. **`resolveDataSourceId` helper**: shared discovery logic used by both
   `getDatabase` and `queryDatabase`. Given a `database_id`, it calls
   `GET /databases/{id}` and reads the `data_sources` array:
   - 1 data source: uses `data_sources[0].id` automatically.
   - \u003e1 data sources: returns an error listing each `{id, name}` so the
     caller can retry with an explicit `data_source_id`.
   - 0 data sources: returns an error.

## affected endpoints

| tool                     | old path                              | new path                                  |
| ------------------------ | ------------------------------------- | ----------------------------------------- |
| `notion_query_database`  | POST `/databases/{id}/query`          | POST `/data_sources/{id}/query`           |
| `notion_get_database`    | GET `/databases/{id}`                 | GET `/data_sources/{id}`                  |
| `notion_search`          | POST `/search` (filter `database`)    | POST `/search` (filter `data_source`)     |

## non-goals

- No `@notionhq/client` SDK upgrade (project uses raw `fetch`).
- No webhook changes.
- `notion_create_page` parent shape (`database_id` vs `data_source_id`) not
  touched in this pass. Separate follow-up.