# deploy script + Dockerfile

## summary

Added a GCP Cloud Run deployment script and multi-stage Dockerfile for the
backend. All GCP config and Notion secrets are read from a local
`.env.production` file (gitignored), so the script is safe for an open source
repo with no hardcoded values.

## files

- `Dockerfile` - multi-stage build (deps, builder, runner) using Next.js 16
  standalone output. Node 20 alpine, non-root user.
- `deploy.sh` - builds and deploys to Cloud Run. Reads all config from
  `.env.production`. Supports `--force` for hotfix deploys from the working
  directory.
- `.env.production.example` - committed template with GCP config + Notion
  secrets placeholders.
- `next.config.ts` - enabled `output: "standalone"` for Docker builds.
- `README.md` - added deploy section with prerequisites and usage.

## usage

```bash
cp .env.production.example .env.production
# fill in values
./deploy.sh
```