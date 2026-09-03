#!/usr/bin/env sh

DEV_CONTAINER="any-ai-for-notion-nextjs-dev"
RUN_CONTAINER="any-ai-for-notion-nextjs-run"

TTY_FLAG=""
if [ -t 0 ]; then
  TTY_FLAG="-it"
fi

remove_container() {
  if docker ps -a --format '{{.Names}}' | grep -q "^$1$"; then
    docker rm -f "$1" 2>/dev/null || true
  fi
}

if [ "$1" = "dev" ] || { [ "$1" = "run" ] && [ "$2" = "dev" ]; }; then
  remove_container "$DEV_CONTAINER"

  docker run \
    $TTY_FLAG \
    --rm \
    --name "$DEV_CONTAINER" \
    -v "$(pwd):/usr/src/app" \
    -w /usr/src/app \
    -p 3000:3000 \
    --env-file .env \
    -e NODE_ENV=development \
    node:22-alpine npm "$@"
else
  remove_container "$RUN_CONTAINER"

  docker run \
    $TTY_FLAG \
    --rm \
    --name "$RUN_CONTAINER" \
    -v "$(pwd):/usr/src/app" \
    -w /usr/src/app \
    node:22-alpine npm "$@"
fi