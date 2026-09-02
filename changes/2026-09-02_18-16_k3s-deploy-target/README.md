## Change

Added a k3s deploy target (deploy.yaml + deploy-k3s.sh) for anyaifornotion.com, mirroring the flutter-agent-kit-landing setup. Cloud Run deploy.sh kept as an alternative target.

## Decisions

- Namespace, deployment, service, and image name: `anyaifornotion`. Image placeholder `registry.ricu.it/anyaifornotion:v1`, overridden at deploy time by `kubectl set image` with the git SHA.
- Runtime env vars (`NOTION_*` from `.env.production`) are synced into k8s Secret `anyaifornotion-env` by deploy-k3s.sh and wired via `envFrom` secretRef. No `NEXT_PUBLIC_*` vars exist in this app, so no Dockerfile build args are needed.
- `ENV_FILE=.env.production` (not `.env.prod` as in the landing kit) because that file already exists here.
- Traefik IngressRoutes: websecure with LE certResolver, `www.anyaifornotion.com` regex redirect to apex, HTTP entrypoint with ACME challenge route (priority 1000) plus https redirect middleware.
- deploy.sh (Cloud Run) intentionally left in place; both deploy targets coexist.

## Files

- `deploy.yaml` (created)
- `deploy-k3s.sh` (created)

## Verification

`bash -n deploy-k3s.sh` and `kubectl apply --dry-run=client --validate=false -f deploy.yaml` both pass.

## First deploy prerequisites (manual)

- DNS: `anyaifornotion.com` and `www.anyaifornotion.com` A records pointing at the k3s node.
- kubectl context pointed at the target cluster.
- Run `./deploy-k3s.sh` from main, answer `y` to apply deploy.yaml.