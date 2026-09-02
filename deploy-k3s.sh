#!/usr/bin/env bash
set -euo pipefail

REGISTRY="registry.ricu.it"
IMAGE="anyaifornotion"
NAMESPACE="anyaifornotion"
DEPLOY_YAML="deploy.yaml"
ENV_FILE=".env.production"
SECRET_NAME="anyaifornotion-env"

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

echo "Building $FULL"
docker build --platform linux/amd64 -t "$FULL" .

echo "Pushing $FULL"
docker push "$FULL"

if [[ -s "$ENV_FILE" ]]; then
  SECRET_ARGS=()
  while IFS='=' read -r key val || [[ -n "$key" ]]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    SECRET_ARGS+=(--from-literal="$key=$val")
  done < "$ENV_FILE"
  if [[ ${#SECRET_ARGS[@]} -gt 0 ]]; then
    echo "Syncing secret $SECRET_NAME"
    kubectl create secret generic "$SECRET_NAME" \
      "${SECRET_ARGS[@]}" \
      -n "$NAMESPACE" \
      --dry-run=client -o yaml | kubectl apply -f -
  else
    echo "Warning: no env vars found in $ENV_FILE, skipping secret sync" >&2
  fi
else
  echo "Warning: $ENV_FILE missing or empty, skipping secret sync" >&2
fi

echo "Apply $DEPLOY_YAML before rollout? Say yes if deploy.yaml changed or first deploy. Say no for code-only updates."
read -rp "[y/N] " ans
if [[ "$ans" =~ ^[Yy]$ ]]; then
  kubectl apply -f "$DEPLOY_YAML"
fi

echo "Updating deployment image"
kubectl set image deployment/"$IMAGE" app="$FULL" -n "$NAMESPACE"

echo "Waiting for rollout"
kubectl rollout status deployment/"$IMAGE" -n "$NAMESPACE"

kubectl get pods -n "$NAMESPACE"
echo "Deployment of $IMAGE:$TAG complete"