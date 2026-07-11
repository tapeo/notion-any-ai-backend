# backend-any-ai-for-notion

Next.js backend that proxies Notion API calls and handles Notion OAuth for the
"Any AI for Notion" mobile app. The app authenticates the user through this
server, stores the tokens, then sends tool calls here so it never touches the
Notion API directly.

## how it works

1. The app calls `/api/notion-oauth/start` to get a Notion authorization URL.
2. The user authorizes in Notion, which redirects to
   `/api/notion-oauth/callback`. The callback exchanges the code for tokens and
   returns an HTML page that deep-links back to the app via the
   `notionopenai://oauth/callback` scheme with the access and refresh tokens.
3. The app stores the tokens and sends tool calls to `/api/notion/tool` with
   the access token in the request body. The server forwards the call to the
   Notion API and returns the result.
4. When the access token expires, the app refreshes it via
   `/api/notion-oauth/refresh`.

The server talks to the Notion API at version `2026-03-11` using raw `fetch`
(no Notion SDK).

## API endpoints

| method | path                         | auth                    | purpose                                             |
| ------ | ---------------------------- | ----------------------- | --------------------------------------------------- |
| GET    | `/api/health`                | none                    | health check, returns `{ "status": "ok" }`          |
| POST   | `/api/notion-oauth/start`    | none                    | returns a Notion authorization URL                  |
| GET    | `/api/notion-oauth/callback` | none                    | OAuth redirect target, deep-links tokens to the app |
| POST   | `/api/notion-oauth/refresh`  | body: `refresh_token`   | exchanges a refresh token for new tokens            |
| POST   | `/api/notion/tool`           | body: `access_token`    | executes a Notion tool by name and arguments        |
| GET    | `/api/notion/self`           | `Authorization: Bearer` | returns the connected bot's workspace info          |

### `/api/notion/tool`

Request body:

```json
{
  "access_token": "secret_...",
  "name": "notion_search",
  "arguments": { "query": "meeting notes" }
}
```

Response:

```json
{
  "content": "...",
  "is_error": false
}
```

## Notion tools

`/api/notion/tool` dispatches the following tool names:

| tool                    | description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `notion_search`         | search pages and data sources                                          |
| `notion_fetch_page`     | get a page by id                                                       |
| `notion_get_blocks`     | get a block's children; renders to markdown by default (`as_markdown`) |
| `notion_get_comments`   | list comments on a block                                               |
| `notion_get_users`      | list users in the workspace                                            |
| `notion_get_database`   | get a data source's schema                                             |
| `notion_query_database` | query a data source with filters and sorts                             |
| `notion_create_page`    | create a page under a parent                                           |
| `notion_update_page`    | update a page's properties                                             |
| `notion_append_blocks`  | append child blocks to a block                                         |
| `notion_update_block`   | update a block                                                         |
| `notion_delete_block`   | delete a block                                                         |
| `notion_archive_page`   | archive or unarchive a page                                            |

### data sources

Notion API version `2026-03-11` uses data sources instead of databases. The
`notion_get_database` and `notion_query_database` tools accept either a
`data_source_id` directly, or a `database_id` that the server resolves to a
data source. If the database has multiple data sources, the server returns an
error listing each one so the caller can retry with an explicit
`data_source_id`.

## environment variables

Copy `.env.example` to `.env` and fill in the values:

| variable                    | description                                    |
| --------------------------- | ---------------------------------------------- |
| `NOTION_CLIENT_ID`          | Notion OAuth client id                         |
| `NOTION_CLIENT_SECRET`      | Notion OAuth client secret                     |
| `NOTION_OAUTH_REDIRECT_URI` | public URL of `/api/notion-oauth/callback`     |
| `NOTION_OAUTH_STATE_SECRET` | random secret used to sign the OAuth state JWT |

## getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The server runs on `http://localhost:3000`. Point the mobile app at this URL.

## deploy

The backend deploys to Google Cloud Run via `deploy.sh`.

### prerequisites

- `gcloud` CLI authenticated (`gcloud auth login`)
- Docker installed and configured
- A GCP project with an Artifact Registry Docker repository
- Docker auth configured for the registry:
  ```bash
  gcloud auth configure-docker europe-docker.pkg.dev
  ```

### first-time setup

1. Copy the example env file:
   ```bash
   cp .env.production.example .env.production
   ```
2. Fill in the GCP config (project id, region, registry, repository) and the
   Notion secrets.
3. Create the Artifact Registry repository if it does not exist yet:
   ```bash
   gcloud artifacts repositories create <GCP_REPO_NAME> \
     --repository-format=docker \
     --location=<GCP_REPO_LOCATION> \
     --project=<GCP_PROJECT_ID>
   ```

### deploy

```bash
./deploy.sh
```

This exports a clean copy of the `main` branch, builds the Docker image, pushes
it to Artifact Registry, and deploys to Cloud Run with the runtime env vars from
`.env.production`.

Use `--force` to deploy from the working directory without pushing first
(useful for hotfixes):

```bash
./deploy.sh --force
```
