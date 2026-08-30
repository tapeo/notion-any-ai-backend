# Project setup

## Create the app

Create a Next.js app with shadcn/ui, then copy the `agents/` folder into it:

```bash
npx shadcn@latest init --template next my-app
cd my-app
cp -r /path/to/nextjs-agent-toolkit/agents .
```

## `package.json` skeleton

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-popover": "^1.1.16",
    "@radix-ui/react-slot": "^1.2.5",
    "@tanstack/react-query": "^5.101.0",
    "bcrypt": "^6.0.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "jose": "^6.2.3",
    "jotai": "^2.20.1",
    "jsonwebtoken": "^9.0.3",
    "lucide-react": "^1.17.0",
    "luxon": "^3.7.2",
    "mongoose": "^9.7.0",
    "next": "16.2.9",
    "next-themes": "^0.4.6",
    "nodemailer": "^8.0.11",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "server-only": "^0.0.1",
    "shadcn": "^4.11.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcrypt": "^6.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/luxon": "^3.7.1",
    "@types/node": "^20",
    "@types/nodemailer": "^8.0.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

Use the latest published versions. Do not pin to a specific major. Install with `npm install`, or via the `npm.sh` wrapper when consistency with the Docker dev environment is required.

### Optional dependencies

Add these only when the feature requires them:

| package | when to add |
| ------- | ----------- |
| `@google-cloud/storage` | Google Cloud Storage uploads |
| `@paddle/paddle-node-sdk` | Paddle payments |
| `dodopayments` | Dodo Payments |
| `standardwebhooks` | Dodo webhook verification |
| `stripe` | Stripe payments |
| `google-auth-library` | Google mobile id_token verification |
| `firebase-admin` | Firebase messaging (if not using the raw v1 HTTP API) |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms with validation |
| `@tiptap/react` + `@tiptap/starter-kit` | Rich text editor |
| `react-markdown` + `remark-gfm` | Markdown rendering |
| `micromark` + `micromark-extension-gfm` | Markdown to HTML server-side |
| `dompurify` + `jsdom` | HTML sanitization |
| `@base-ui/react` | Unstyled primitives (popovers, menus) |
| `cmdk` | Command palette |
| `next-themes` | Theme toggle beyond the inline script |

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/models/*": ["./model/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", "shared"]
}
```

`strict: true`, never disable. `@/*` alias maps to the project root so `@/components/...`, `@/hooks/...`, `@/model/...`, `@/schemas/...`, `@/lib/...` all resolve.

## `eslint.config.mjs`

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'shared/**', 'next-env.d.ts']),
  { rules: { 'react/no-unescaped-entities': 'off' } },
]);

export default eslintConfig;
```

Never use `// eslint-disable-next-line`. Fix the underlying issue.

## `next.config.ts`

```ts
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
```

`output: 'standalone'` produces a self-contained `.next/standalone/server.js` for the Dockerfile. `outputFileTracingRoot` pins the tracing root so the standalone output is not nested under the absolute build path.

## `components.json` (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/client/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Add the base component set:

```bash
npx shadcn@latest add button input label textarea checkbox select dialog alert-dialog dropdown-menu popover sheet separator sonner skeleton scroll-area switch table tabs tooltip command avatar badge accordion
```

## `postcss.config.mjs`

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

## `app/globals.css`

See `.ai/ui.md` for the full Tailwind v4 import block with `@theme inline` token mapping and `:root` / `.dark` variable definitions.

## `proxy.ts`

See `.ai/architecture.md` for the middleware boilerplate. The kit names the middleware file `proxy.ts` (not `middleware.ts`) to avoid confusion with the `middlewares/` folder of route wrappers. Next.js detects the default export as the middleware entry.

## `.gitignore`

```gitignore
node_modules/
.next/
dist/
build/
out/
coverage/
*.tsbuildinfo
.vercel
.DS_Store
.env.local
.env.production
*.lock
```

## Environment variables

`.env.local` (development, gitignored) and `.env.production` (production, gitignored). Commit `.env.example` as a reference.

```
MONGODB_URI=mongodb://localhost:27017/local
DOMAIN=localhost:3000
ENV=development
ACCESS_TOKEN_SECRET=<64-char hex>
REFRESH_TOKEN_SECRET=<64-char hex>
ENCRYPTION_KEY=<64-char hex>
NEXT_PUBLIC_BACKEND_API_URL=/api
NEXT_PUBLIC_ALLOW_SIGNUP=true
```

`NEXT_PUBLIC_*` vars are inlined at build time. All others are server-only. Generate secrets with:

```bash
openssl rand -hex 32
```

---

## Docker dev

### `dev.sh`

```sh
#!/usr/bin/env sh
set -e

COMPOSE_FILE="docker-compose.local.yml"

usage() {
  echo "Usage: ./dev.sh [up|down|logs|rebuild|...docker compose args]"
  exit 0
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then usage; fi

CMD="${1:-up}"
shift 2>/dev/null || true

if [ "$CMD" = "rebuild" ]; then
  docker compose -f "$COMPOSE_FILE" down
  docker compose -f "$COMPOSE_FILE" build
  docker compose -f "$COMPOSE_FILE" up
  exit 0
fi

if [ "$CMD" = "logs" ]; then
  docker compose -f "$COMPOSE_FILE" logs -f app
  exit 0
fi

if [ "$CMD" = "up" ]; then
  exec docker compose -f "$COMPOSE_FILE" up "$@"
else
  exec docker compose -f "$COMPOSE_FILE" "$CMD" "$@"
fi
```

### `docker-compose.local.yml`

```yaml
services:
  mongodb:
    image: docker.io/mongodb/mongodb-community-server:latest
    container_name: my-app-mongodb
    restart: unless-stopped
    networks:
      - my-app-network
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db

  app:
    image: node:24-alpine
    container_name: my-app-app
    depends_on:
      - mongodb
    working_dir: /usr/src/app
    networks:
      - my-app-network
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    environment:
      MONGODB_URI: "mongodb://my-app-mongodb:27017/local?directConnection=true"
      NEXT_PUBLIC_BACKEND_API_URL: "/api"
      WATCHPACK_POLLING: "true"
    volumes:
      - .:/usr/src/app
    command:
      - sh
      - -c
      - |
        npm install
        npx next dev

networks:
  my-app-network:
    driver: bridge

volumes:
  mongodb-data:
```

Start:

```bash
./dev.sh up
```

The app is at `http://localhost:3000`, MongoDB at `localhost:27017`.

### `npm.sh` wrapper (optional)

For running npm commands in the same container as `dev.sh`, to avoid host/container environment mismatches:

```sh
#!/usr/bin/env sh
PROJECT_NAME="my-app"
NODE_IMAGE="node:24-alpine"
NETWORK_NAME="${PROJECT_NAME}-network"
MONGODB_CONTAINER="${PROJECT_NAME}-mongodb"

ensure_network() {
  if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
    docker network create "$NETWORK_NAME"
  fi
}

ensure_mongodb() {
  if ! docker ps --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER}$"; then
    if docker ps -a --format '{{.Names}}' | grep -q "^${MONGODB_CONTAINER}$"; then
      docker start "$MONGODB_CONTAINER"
    else
      docker run -d \
        --name "$MONGODB_CONTAINER" \
        --restart unless-stopped \
        --network "$NETWORK_NAME" \
        -p 27017:27017 \
        -v mongodb-data:/data/db \
        docker.io/mongodb/mongodb-community-server:latest
    fi
  fi
}

ensure_nextjs_removed() {
  container_name="$1"
  if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
    docker rm -f "$container_name" 2>/dev/null || true
  fi
}

TTY_FLAG=""
if [ -t 0 ]; then TTY_FLAG="-it"; fi

if [ "$1" = "dev" ] || { [ "$1" = "run" ] && [ "$2" = "dev" ]; }; then
  NEXTJS_CONTAINER="${PROJECT_NAME}-dev"
  ensure_nextjs_removed "$NEXTJS_CONTAINER"
  ensure_network
  ensure_mongodb
  docker run \
    $TTY_FLAG --rm \
    --name "$NEXTJS_CONTAINER" \
    --network "$NETWORK_NAME" \
    -v "$(pwd):/usr/src/app" -w /usr/src/app -p 3000:3000 \
    -e NODE_ENV=development \
    -e MONGODB_URI=mongodb://$MONGODB_CONTAINER:27017/test?directConnection=true \
    $NODE_IMAGE sh -c 'if [ ! -d node_modules/next ]; then npm install; fi; exec npm "$@"' sh "$@"
else
  NEXTJS_CONTAINER="${PROJECT_NAME}-run"
  ensure_nextjs_removed "$NEXTJS_CONTAINER"
  docker run \
    $TTY_FLAG --rm \
    --name "$NEXTJS_CONTAINER" \
    -v "$(pwd):/usr/src/app" -w /usr/src/app \
    $NODE_IMAGE sh -c 'if [ ! -d node_modules/next ]; then npm install; fi; exec npm "$@"' sh "$@"
fi
```

Use:

```bash
./npm.sh install
./npm.sh run lint
./npm.sh run build
```

Containers are named per command type (`<project>-dev` for `dev`, `<project>-run` for everything else), so running `lint` while `dev` is active no longer kills the dev container. Re-running the same command replaces its own container only.

To run a command inside the already-running dev container instead of starting a new one:

```bash
docker exec -it <project>-dev npm run lint
```

---

## Dockerfile (production)

```dockerfile
# Stage 1: dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_ALLOW_SIGNUP
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_BACKEND_API_URL=${NEXT_PUBLIC_BACKEND_API_URL}
ENV NEXT_PUBLIC_ALLOW_SIGNUP=${NEXT_PUBLIC_ALLOW_SIGNUP}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

RUN npm run build

# Stage 3: production runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Build:

```bash
docker build \
  --build-arg NEXT_PUBLIC_BACKEND_API_URL=/api \
  --build-arg NEXT_PUBLIC_ALLOW_SIGNUP=true \
  --build-arg NEXT_PUBLIC_APP_URL=https://example.com \
  -t my-app .
```

`NEXT_PUBLIC_*` must be present at build time, Next.js inlines them into the client bundle. Server-only env vars are read at runtime from the deployment environment.

---

## `.dockerignore`

Prevents env files, secrets, deploy manifests, and dev infra from entering the image:

```
node_modules
.next
out
build
dist
.git
.gitignore
.env*
Dockerfile
.dockerignore
deploy.yaml
deploy-k3s.sh
docker-compose.local.yml
dev.sh
npm.sh
README.md
GETTING_STARTED.md
AGENTS.md
CLAUDE.md
CURSOR.md
GEMINI.md
.ai
changes
*.tsbuildinfo
.DS_Store
coverage
```

---

## Deploy

The scaffold asks you to pick a deploy target. Each ships a different set of files:

| target | files copied | notes |
| --- | --- | --- |
| k3s | `deploy.yaml`, `deploy-k3s.sh` | Self-hosted k3s VPS, Traefik ingress, Let's Encrypt |
| GCP Cloud Run | `deploy.sh` | `gcloud` CLI, Artifact Registry, `--env-vars-file` |
| Vercel | none | Auto-detects Next.js, env vars in dashboard |
| none | none | Skip deploy files, add later from this guide |

`.dockerignore` is always copied (the Dockerfile is always present). Pick the target that matches your infrastructure. You can always add another target's files later by copying them from this guide.

### k3s

The kit ships a k3s deployment template: `deploy.yaml` (manifest) and `deploy-k3s.sh` (build + push + secret sync + rollout). Target is a self-hosted k3s VPS with Traefik (k3s default ingress) and Let's Encrypt via `certResolver: le`.

### `deploy.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: registry.example.com/my-app:v1
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          env:
            - name: HOSTNAME
              value: "0.0.0.0"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: MONGODB_URI
            - name: DOMAIN
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: DOMAIN
            - name: ENV
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: ENV
            - name: ACCESS_TOKEN_SECRET
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: ACCESS_TOKEN_SECRET
            - name: REFRESH_TOKEN_SECRET
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: REFRESH_TOKEN_SECRET
            - name: ENCRYPTION_KEY
              valueFrom:
                secretKeyRef:
                  name: my-app-env
                  key: ENCRYPTION_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: my-app
spec:
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: my-app-https-redirect
  namespace: my-app
spec:
  redirectScheme:
    scheme: https
    permanent: true
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: my-app
  namespace: my-app
spec:
  entryPoints: [websecure]
  routes:
    - match: Host(`my-app.example.com`)
      kind: Rule
      services:
        - name: my-app
          port: 80
  tls:
    certResolver: le
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: my-app-http
  namespace: my-app
spec:
  entryPoints: [web]
  routes:
    - match: Host(`my-app.example.com`) && PathPrefix(`/.well-known/acme-challenge/`)
      kind: Rule
      priority: 1000
      services:
        - name: my-app
          port: 80
    - match: Host(`my-app.example.com`)
      kind: Rule
      middlewares:
        - name: my-app-https-redirect
      services:
        - name: my-app
          port: 80
```

Six resources in one file:

1. **Namespace** `my-app`.
2. **Deployment** (1 replica, container `app`, port 3000, `imagePullPolicy: Always`). The `:v1` tag is a placeholder, overridden at deploy time by `kubectl set image` with the git SHA. Server-only env vars (`MONGODB_URI`, `DOMAIN`, `ENV`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_KEY`) are wired via `secretKeyRef` to the `my-app-env` Secret. `NEXT_PUBLIC_*` vars are not listed here, they are baked into the client bundle at build time via the Dockerfile `ARG`/`ENV` lines.
3. **Service** (ClusterIP, port 80 -> targetPort 3000).
4. **Middleware** `my-app-https-redirect` (permanent redirect to HTTPS).
5. **IngressRoute** `my-app` (entryPoint `websecure`, TLS with `certResolver: le`).
6. **IngressRoute** `my-app-http` (entryPoint `web`, ACME challenge passthrough at priority 1000, catch-all HTTPS redirect).

### `deploy-k3s.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

REGISTRY="registry.example.com"
IMAGE="my-app"
NAMESPACE="my-app"
DEPLOY_YAML="deploy.yaml"
ENV_FILE=".env.production"
SECRET_NAME="my-app-env"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" ]]; then
  echo "Error: current branch is '$BRANCH'. Switch to main before deploying." >&2
  exit 1
fi

echo "Fetching origin/main"
git fetch origin main

LOCAL="$(git rev-parse main)"
REMOTE="$(git rev-parse origin/main)"
if [[ "$LOCAL" != "$REMOTE" ]]; then
  echo "Error: local main ($LOCAL) does not match origin/main ($REMOTE)." >&2
  echo "Pull or rebase before deploying." >&2
  exit 1
fi

TAG="${1:-$(git rev-parse --short origin/main)}"
FULL="$REGISTRY/$IMAGE:$TAG"

if [[ -s "$ENV_FILE" ]]; then
  BUILD_ARGS=()
  SECRET_ARGS=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    line="${line#"${line%%[![:space:]]*}"}"
    key="${line%%=*}"
    [[ "$key" == "$line" ]] && continue
    val="${line#*=}"

    if [[ "$val" =~ ^\'([^\']*)\'([[:space:]]*#.*)?$ ]]; then
      val="${BASH_REMATCH[1]}"
    elif [[ "$val" =~ ^\"([^\"]*)\"([[:space:]]*#.*)?$ ]]; then
      val="${BASH_REMATCH[1]}"
    else
      val="${val%%[[:space:]]#*}"
      val="${val%"${val##*[![:space:]]}"}"
    fi

    if [[ "$key" == NEXT_PUBLIC_* ]]; then
      BUILD_ARGS+=(--build-arg "$key=$val")
    else
      SECRET_ARGS+=(--from-literal="$key=$val")
    fi
  done < "$ENV_FILE"
else
  echo "Warning: $ENV_FILE missing or empty. Build will use Dockerfile defaults, secret sync skipped." >&2
fi

echo "Building $FULL"
if [[ ${#BUILD_ARGS[@]} -gt 0 ]]; then
  docker build --platform linux/amd64 "${BUILD_ARGS[@]}" -t "$FULL" .
else
  docker build --platform linux/amd64 -t "$FULL" .
fi

echo "Pushing $FULL"
docker push "$FULL"

echo "Apply $DEPLOY_YAML before rollout? Say yes if deploy.yaml changed or first deploy. Say no for code-only updates."
read -rp "[y/N] " ans
if [[ "$ans" =~ ^[Yy]$ ]]; then
  kubectl apply -f "$DEPLOY_YAML"
fi

if [[ -s "$ENV_FILE" && ${#SECRET_ARGS[@]:-0} -gt 0 ]]; then
  echo "Syncing secret $SECRET_NAME"
  kubectl create secret generic "$SECRET_NAME" \
    "${SECRET_ARGS[@]}" \
    -n "$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

echo "Updating deployment image"
kubectl set image deployment/"$IMAGE" app="$FULL" -n "$NAMESPACE"

echo "Waiting for rollout"
kubectl rollout status deployment/"$IMAGE" -n "$NAMESPACE"

kubectl get pods -n "$NAMESPACE"
echo "Deployment of $IMAGE:$TAG complete"
```

### Usage

```bash
./deploy-k3s.sh           # tag defaults to short SHA of origin/main
./deploy-k3s.sh v2        # explicit tag
```

### Before first deploy

1. Replace `registry.example.com` in both `deploy.yaml` and `deploy-k3s.sh` with your registry.
2. Replace `my-app.example.com` in `deploy.yaml` (both IngressRoutes) with your domain.
3. Create `.env.production` with all server-only vars and `NEXT_PUBLIC_*` vars (same keys as `.env.example`, production values).
4. Point `kubectl` at the k3s cluster (`KUBECONFIG` or `~/.kube/config`).
5. Ensure a DNS A record for your domain points at the VPS IP. Let's Encrypt needs it to issue the cert.

### How env vars work

The script parses `.env.production` once and splits vars into two groups:

- `NEXT_PUBLIC_*`: passed as `--build-arg` to `docker build`. The Dockerfile `ARG`/`ENV` lines bake them into the client bundle. Runtime secret values only affect server-side code.
- All others: synced into the `my-app-env` Secret via `kubectl create secret ... --dry-run=client -o yaml | kubectl apply -f -` (idempotent upsert). The Deployment reads them via `secretKeyRef`.

The Secret is re-synced on every deploy, so `.env.production` edits propagate on the next run without a separate command.

### Adding env vars

When you add a new server-only env var (e.g. `SMTP_HOST`):

1. Add it to `.env.example` and `.env.production`.
2. Add a `secretKeyRef` block to `deploy.yaml` under the container `env` list.
3. The deploy script picks it up automatically from `.env.production`.

`NEXT_PUBLIC_*` vars do not need a `secretKeyRef` in `deploy.yaml`, they are build-time only. Just add the `ARG`/`ENV` line to the Dockerfile and the var to `.env.production`.

### Optional: rate-limit middleware

To protect a specific route (e.g. login brute-force), add a separate `<app>-rate-limit.yaml`:

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: my-app-rate-limit
  namespace: my-app
spec:
  rateLimit:
    average: 5
    burst: 10
```

Then split the `websecure` IngressRoute into two priority-ordered routes so the middleware applies only to the target path, not to static assets:

```yaml
routes:
  - match: Host(`my-app.example.com`) && PathPrefix(`/api/auth/login`)
    kind: Rule
    priority: 100
    middlewares:
      - name: my-app-rate-limit
    services:
      - name: my-app
        port: 80
  - match: Host(`my-app.example.com`)
    kind: Rule
    services:
      - name: my-app
        port: 80
```

Apply it with `kubectl apply -f <app>-rate-limit.yaml`. Keep it in a separate file so the deploy script's interactive `deploy.yaml` apply prompt can skip it for code-only updates.

### Optional: service account key secret

If the app needs a service account JSON (e.g. Google Cloud credentials), mount it as a separate Secret from a file path in `.env.production`:

```yaml
# In deploy.yaml, container env:
- name: GOOGLE_APPLICATION_CREDENTIALS
  value: /etc/keys/key.json
# In deploy.yaml, container volumeMounts:
volumeMounts:
  - name: key
    mountPath: /etc/keys
    readOnly: true
# In deploy.yaml, pod volumes:
volumes:
  - name: key
    secret:
      secretName: my-app-key
```

Add to `deploy-k3s.sh` (after the env secret sync):

```bash
KEY_PATH_VAR="GOOGLE_APPLICATION_CREDENTIALS"
ENV_SKIP_RE="^(GOOGLE_APPLICATION_CREDENTIALS)$"
# Skip KEY_PATH_VAR in the SECRET_ARGS loop, then:
KEY_FILE=""
# ...read KEY_PATH_VAR value from .env.production...
kubectl create secret generic my-app-key \
  --from-file="key.json=$KEY_FILE" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Notes

- No probes or resource limits in the template. Add a readiness probe on a 200-returning path (e.g. `/login`) and resource requests/limits as the app matures.
- Single replica, no HA. Scale `replicas` and add a PodDisruptionBudget if needed.
- Multi-line env values are not supported by the `--from-literal` loop. Keep base64 keys single-line in `.env.production`.

---

### GCP Cloud Run

The kit ships a `deploy.sh` script that builds the image, pushes to Artifact Registry, and deploys to Cloud Run with runtime env vars from `.env.production`. It exports clean source from git (so secrets never enter the image), passes `NEXT_PUBLIC_*` as build args, and sends server-only vars via `--env-vars-file`.

#### `deploy.sh`

```bash
#!/bin/bash
#
# GCP Cloud Run Deployment Script
# =================================================================
#
# Builds and deploys the Next.js app to Google Cloud Run. Exports clean
# source from git, builds the Docker image with NEXT_PUBLIC_* build args,
# pushes it to Artifact Registry, and deploys with runtime env vars read
# from .env.production.
#
# Usage: ./deploy.sh [--force]
#
# Requirements:
#   - gcloud CLI authenticated and configured
#   - Docker installed and configured
#   - Access to the GCP project and Artifact Registry repository
#   - .env.production file with GCP config and app secrets
#
# --force: skip git sync check and export tracked files from the working
#          directory instead of origin/main. Useful for hotfixes.
#

set -eo pipefail

ENV_FILE=".env.production"
TARGET_BRANCH="main"
DOCKER_PLATFORM="linux/amd64"
DOCKERFILE="Dockerfile"
IMAGE_TAG="production"

RUNTIME_ENV_KEYS=(
    MONGODB_URI
    DOMAIN
    ENV
    ACCESS_TOKEN_SECRET
    REFRESH_TOKEN_SECRET
    ENCRYPTION_KEY
)

REQUIRED_CONFIG_KEYS=(
    GCP_PROJECT_ID
    GCP_REGION
    GCP_REGISTRY
    GCP_REPO_NAME
    GCP_REPO_LOCATION
    CLOUD_RUN_SERVICE_NAME
    CLOUD_RUN_MEMORY
    CLOUD_RUN_CPU
    CLOUD_RUN_TIMEOUT
    CLOUD_RUN_CONCURRENCY
    CLOUD_RUN_MIN_INSTANCES
    CLOUD_RUN_MAX_INSTANCES
)

log_info()  { echo "==> $1" >&2; }
log_error() { echo "ERROR: $1" >&2; }
log_warn()  { echo "WARN: $1" >&2; }

cleanup() {
    if [[ -n "${TMPDIR_SRC:-}" ]] && [[ -d "$TMPDIR_SRC" ]]; then
        rm -rf "$TMPDIR_SRC"
        log_info "Cleaned up temporary source directory"
    fi
    if [[ -n "${ENV_JSON_FILE:-}" ]] && [[ -f "$ENV_JSON_FILE" ]]; then
        rm -f "$ENV_JSON_FILE"
        log_info "Cleaned up temporary env vars file"
    fi
}

trap cleanup EXIT

get_env_value() {
    local file="$1"
    local key="$2"
    grep "^${key}=" "$file" 2>/dev/null | head -1 | sed "s/^${key}=//;s/^['\"]//;s/['\"]$//"
}

load_config() {
    local env_file="$1"
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: ${env_file}"
        echo "Create ${env_file} with GCP config and app secrets (see .ai/setup.md)." >&2
        exit 1
    fi
    if [[ ! -s "$env_file" ]]; then
        log_error "Environment file is empty: ${env_file}"
        exit 1
    fi
    for key in "${REQUIRED_CONFIG_KEYS[@]}"; do
        local value
        value=$(get_env_value "$env_file" "$key")
        if [[ -z "$value" ]]; then
            log_error "Missing required config key '${key}' in ${env_file}"
            exit 1
        fi
    done
    GCP_PROJECT_ID=$(get_env_value "$env_file" "GCP_PROJECT_ID")
    GCP_REGION=$(get_env_value "$env_file" "GCP_REGION")
    GCP_REGISTRY=$(get_env_value "$env_file" "GCP_REGISTRY")
    GCP_REPO_NAME=$(get_env_value "$env_file" "GCP_REPO_NAME")
    GCP_REPO_LOCATION=$(get_env_value "$env_file" "GCP_REPO_LOCATION")
    CLOUD_RUN_SERVICE_NAME=$(get_env_value "$env_file" "CLOUD_RUN_SERVICE_NAME")
    CLOUD_RUN_MEMORY=$(get_env_value "$env_file" "CLOUD_RUN_MEMORY")
    CLOUD_RUN_CPU=$(get_env_value "$env_file" "CLOUD_RUN_CPU")
    CLOUD_RUN_TIMEOUT=$(get_env_value "$env_file" "CLOUD_RUN_TIMEOUT")
    CLOUD_RUN_CONCURRENCY=$(get_env_value "$env_file" "CLOUD_RUN_CONCURRENCY")
    CLOUD_RUN_MIN_INSTANCES=$(get_env_value "$env_file" "CLOUD_RUN_MIN_INSTANCES")
    CLOUD_RUN_MAX_INSTANCES=$(get_env_value "$env_file" "CLOUD_RUN_MAX_INSTANCES")
    log_info "Configuration loaded from ${env_file}"
}

verify_git_sync() {
    local branch="$1"
    local force="$2"
    if [[ "$force" == "true" ]]; then
        log_info "Force mode: skipping git sync check"
        return
    fi
    git fetch origin
    local local_sha remote_sha
    local_sha=$(git rev-parse "$branch")
    remote_sha=$(git rev-parse "origin/${branch}")
    if [[ "$local_sha" != "$remote_sha" ]]; then
        log_error "Local branch ${branch} is not aligned with origin/${branch}"
        echo "Run: git push origin ${branch}" >&2
        exit 1
    fi
    log_info "Git branch ${branch} is in sync with remote"
}

export_source() {
    local branch="$1"
    local force="$2"
    local tmpdir
    tmpdir=$(mktemp -d)
    local toplevel
    toplevel=$(git rev-parse --show-toplevel)
    if [[ "$force" == "true" ]]; then
        log_info "Force mode: exporting tracked files from working directory"
        ( cd "$toplevel" && git ls-files -z ) \
            | tar --null --files-from=- -cf - \
            | tar -xf - -C "$tmpdir"
    else
        log_info "Exporting from origin/${branch}"
        ( cd "$toplevel" && git archive --format=tar "origin/${branch}" ) \
            | tar -xf - -C "$tmpdir"
    fi
    echo "$tmpdir"
}

verify_docker_auth() {
    local registry="$1"
    if ! grep -q "$registry" ~/.docker/config.json 2>/dev/null; then
        log_warn "Docker config not found for ${registry}"
        echo "If push fails, run: gcloud auth configure-docker ${registry}" >&2
    fi
}

verify_artifact_registry() {
    local repo_name="$1"
    local repo_location="$2"
    local project_id="$3"
    if gcloud artifacts repositories describe "$repo_name" \
            --location="$repo_location" \
            --project="$project_id" &>/dev/null; then
        log_info "Artifact Registry repository verified: ${repo_name}"
        return
    fi
    log_warn "Artifact Registry repository '${repo_name}' not found in ${repo_location}"
    echo -n "Create it now? [Y/n] " >&2
    local answer
    read -r answer
    if [[ "$answer" =~ ^[Nn]$ ]]; then
        log_error "Cannot continue without Artifact Registry repository"
        exit 1
    fi
    log_info "Creating Artifact Registry repository: ${repo_name}"
    gcloud artifacts repositories create "$repo_name" \
        --repository-format=docker \
        --location="$repo_location" \
        --project="$project_id"
    log_info "Artifact Registry repository created: ${repo_name}"
}

collect_build_args() {
    local env_file="$1"
    BUILD_ARGS=()
    while IFS= read -r line || [[ -n "$line" ]]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        line="${line#"${line%%[![:space:]]*}"}"
        key="${line%%=*}"
        [[ "$key" == "$line" ]] && continue
        if [[ "$key" == NEXT_PUBLIC_* ]]; then
            val="${line#*=}"
            val="${val%%[[:space:]]#*}"
            val="${val%\"}"
            val="${val#\'}"
            val="${val%\'}"
            BUILD_ARGS+=(--build-arg "$key=$val")
        fi
    done < "$env_file"
}

build_image() {
    local tmpdir="$1"
    local image_name="$2"
    local dockerfile="$3"
    local platform="$4"
    log_info "Building Docker image: ${image_name}"
    if [[ ${#BUILD_ARGS[@]} -gt 0 ]]; then
        docker build --platform "$platform" "${BUILD_ARGS[@]}" -f "${tmpdir}/${dockerfile}" -t "${image_name}" "$tmpdir"
    else
        docker build --platform "$platform" -f "${tmpdir}/${dockerfile}" -t "${image_name}" "$tmpdir"
    fi
}

push_image() {
    local image_name="$1"
    log_info "Pushing Docker image: ${image_name}"
    docker push "${image_name}"
}

convert_env_to_json() {
    local env_file="$1"
    local output_file="$2"
    python3 - "$env_file" "$output_file" "${RUNTIME_ENV_KEYS[@]}" <<'PYEOF'
import json, sys, re
env_file, output_file = sys.argv[1], sys.argv[2]
keys = sys.argv[3:]
values = {}
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$', line)
        if not m:
            continue
        key, val = m.group(1), m.group(2)
        if key not in keys:
            continue
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        values[key] = val
with open(output_file, 'w') as f:
    json.dump(values, f)
print(f"Extracted {len(values)} runtime env vars from {env_file}", file=sys.stderr)
PYEOF
}

prepare_env_vars() {
    local env_file="$1"
    for key in "${RUNTIME_ENV_KEYS[@]}"; do
        local value
        value=$(get_env_value "$env_file" "$key")
        if [[ -z "$value" ]]; then
            log_error "Missing runtime env var '${key}' in ${env_file}"
            exit 1
        fi
    done
    local env_json_file
    env_json_file=$(mktemp)
    convert_env_to_json "$env_file" "$env_json_file"
    if [[ ! -s "$env_json_file" ]] || [[ "$(cat "$env_json_file")" == "{}" ]]; then
        log_error "No valid runtime env vars found in ${env_file}"
        rm -f "$env_json_file"
        exit 1
    fi
    echo "$env_json_file"
}

deploy_cloud_run() {
    local service_name="$1" project_id="$2" image_name="$3" region="$4"
    local port="$5" memory="$6" cpu="$7" timeout="$8" concurrency="$9"
    local min_instances="${10}" max_instances="${11}" env_vars_flag="${12}"
    log_info "Deploying to Cloud Run: ${service_name}"
    gcloud run deploy "$service_name" \
        --project="$project_id" \
        --image "$image_name" \
        --region="$region" \
        --platform=managed \
        --quiet --allow-unauthenticated \
        --port="$port" \
        --memory="$memory" --cpu="$cpu" \
        --timeout="$timeout" \
        --concurrency="$concurrency" \
        --min-instances="$min_instances" --max-instances="$max_instances" \
        ${env_vars_flag}
}

main() {
    local force="false"
    for arg in "$@"; do
        case "$arg" in
            --force) force="true" ;;
            *) log_error "Unknown argument: $arg"; echo "Usage: $0 [--force]" >&2; exit 1 ;;
        esac
    done
    log_info "Starting deployment for environment: production"
    load_config "$ENV_FILE"
    local image_name="${GCP_REGISTRY}/${GCP_PROJECT_ID}/${GCP_REPO_NAME}/my-app:${IMAGE_TAG}"
    verify_git_sync "$TARGET_BRANCH" "$force"
    TMPDIR_SRC=$(export_source "$TARGET_BRANCH" "$force")
    log_info "Source exported to ${TMPDIR_SRC}"
    verify_docker_auth "$GCP_REGISTRY"
    verify_artifact_registry "$GCP_REPO_NAME" "$GCP_REPO_LOCATION" "$GCP_PROJECT_ID"
    collect_build_args "$ENV_FILE"
    build_image "$TMPDIR_SRC" "$image_name" "$DOCKERFILE" "$DOCKER_PLATFORM"
    push_image "$image_name"
    ENV_JSON_FILE=$(prepare_env_vars "$ENV_FILE")
    local env_vars_flag="--env-vars-file=${ENV_JSON_FILE}"
    deploy_cloud_run \
        "$CLOUD_RUN_SERVICE_NAME" "$GCP_PROJECT_ID" "$image_name" "$GCP_REGION" \
        "3000" "$CLOUD_RUN_MEMORY" "$CLOUD_RUN_CPU" "$CLOUD_RUN_TIMEOUT" \
        "$CLOUD_RUN_CONCURRENCY" "$CLOUD_RUN_MIN_INSTANCES" "$CLOUD_RUN_MAX_INSTANCES" \
        "$env_vars_flag"
    log_info "Deployment completed successfully!"
    log_info "Service: ${CLOUD_RUN_SERVICE_NAME}"
    log_info "Image:   ${image_name}"
}

main "$@"
```

#### Usage

```bash
./deploy.sh           # deploy from origin/main
./deploy.sh --force   # deploy from working directory, skip git sync check
```

#### Before first deploy

1. Add GCP config keys to `.env.production` (these are deploy-specific, not app vars, so they are not in `.env.example`):

```
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=europe-west1
GCP_REGISTRY=europe-docker.pkg.dev
GCP_REPO_NAME=my-app
GCP_REPO_LOCATION=europe
CLOUD_RUN_SERVICE_NAME=my-app
CLOUD_RUN_MEMORY=512Mi
CLOUD_RUN_CPU=1
CLOUD_RUN_TIMEOUT=60s
CLOUD_RUN_CONCURRENCY=10
CLOUD_RUN_MIN_INSTANCES=0
CLOUD_RUN_MAX_INSTANCES=2
```

2. Run `gcloud auth login` and `gcloud auth configure-docker <GCP_REGISTRY>`.
3. The script interactively offers to create the Artifact Registry repository if it does not exist.
4. Ensure the app env vars (`MONGODB_URI`, `DOMAIN`, `ENV`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_KEY`, and any `NEXT_PUBLIC_*`) are in `.env.production`.

#### How env vars work

The script splits `.env.production` into three groups:

- **GCP config keys** (`GCP_*`, `CLOUD_RUN_*`): consumed by the script only, never sent to Cloud Run.
- **`NEXT_PUBLIC_*`**: passed as `--build-arg` to `docker build`, baked into the client bundle.
- **Runtime env keys** (`MONGODB_URI`, `DOMAIN`, `ENV`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_KEY`): extracted to a temp JSON and passed via `--env-vars-file` to `gcloud run deploy`.

The temp JSON is deleted by a cleanup trap. Secrets never enter the image: the build context is `git archive origin/main` (or `git ls-files` with `--force`), so gitignored files like `.env.production` are excluded.

#### `--force` flag

Skips the git sync check and exports tracked files from the working directory instead of `origin/main`. Useful for hotfixes. Still excludes gitignored files (only `git ls-files` tracked files are exported).

#### Cloud Run flags

| flag | source | default |
| --- | --- | --- |
| `--port` | hard-coded | `3000` |
| `--memory` | `$CLOUD_RUN_MEMORY` | `512Mi` |
| `--cpu` | `$CLOUD_RUN_CPU` | `1` |
| `--timeout` | `$CLOUD_RUN_TIMEOUT` | `60s` |
| `--concurrency` | `$CLOUD_RUN_CONCURRENCY` | `10` |
| `--min-instances` | `$CLOUD_RUN_MIN_INSTANCES` | `0` (scale to zero) |
| `--max-instances` | `$CLOUD_RUN_MAX_INSTANCES` | `2` |
| `--allow-unauthenticated` | hard-coded | public service |

No `--service-account`, `--vpc-connector`, or `--ingress` flags are set. The service uses the project default service account, direct egress, and unrestricted ingress. Add these as needed for your security posture.

### Vercel

No deploy files are needed. Vercel auto-detects Next.js and builds from the repo. Two options:

- **Git integration**: connect the repo in the Vercel dashboard. Pushes to `main` auto-deploy. Set env vars in Project Settings > Environment Variables.
- **CLI**: run `vercel` to link the project and deploy. Run `vercel env add` for each variable.

Set these env vars in the Vercel dashboard (or via CLI):

- `MONGODB_URI`
- `DOMAIN`
- `ENV`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ENCRYPTION_KEY`
- Any `NEXT_PUBLIC_*` vars (these are available at build time automatically)

Vercel reads `NEXT_PUBLIC_*` from the environment at build time, so no build args are needed. The `output: 'standalone'` in `next.config.ts` is compatible with Vercel's build output.

### Other targets

Fly.io and Railway also work with the standalone output or the Next.js build directly. The kit does not prescribe a single platform. Copy the relevant deploy files from this guide if you switch targets later.

---

## Build and environment commands

```bash
# Development
./dev.sh up                      # Docker Compose dev (app + MongoDB)
npm run dev                      # Plain dev (set MONGODB_URI manually)

# Lint and typecheck
npm run lint
npx tsc --noEmit

# Build
npm run build
npm run start                    # Production server (non-Docker)

# Docker
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## Diagnostic tools

To diagnose a Next.js app, use the Next.js devtools and the `next-devtools` MCP if available.

```bash
# Inspect a running dev server
next dev
# Open the browser, use the React DevTools and Next.js instrumentation.
```

Use the Inspector for the route tree, server component timings, and bundle analysis. Use the Network tab for API requests and SSE streams.