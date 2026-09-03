## Change

Added `npm.sh`, a Docker-wrapped npm passthrough so all npm commands run in a `node:22-alpine` container instead of the host.

## Decisions

- Simplified from `web-ttclubmanager/npm.sh`: no MongoDB ensure/initiate/self-heal (this backend has no DB), no Docker network, no libcurl install.
- Image `node:22-alpine` matches the Dockerfile. Reference pins `22.12.0-alpine` and uses bookworm-slim for non-dev; here one image for all paths.
- Dev path (`npm.sh dev` or `npm.sh run dev`): port 3000, `--env-file .env`, `NODE_ENV=development`. Non-dev path: same mount, no ports, no env wiring (`next build` reads `.env` from the mounted dir itself).
- `--env-file .env` instead of passing each `NOTION_*` var individually.
- TTY flag trick kept so it works in CI (`-it` only when stdin is a TTY).
- Container names: `any-ai-for-notion-nextjs-dev` and `any-ai-for-notion-nextjs-run`, removed before each run for clean `--rm` behavior.

## Files

- `npm.sh` (created)

## Verification

`./npm.sh run build` succeeds (18 pages, standalone output). `./npm.sh run dev` serves `/api/health` with 200 on port 3000.