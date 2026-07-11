#!/bin/bash
#
# GCP Cloud Run Deployment Script for Any AI for Notion Backend
# =================================================================
#
# Builds and deploys the Next.js backend to Google Cloud Run.
# Exports clean source from git, builds the Docker image, pushes it to
# Artifact Registry, and deploys with runtime env vars read from
# .env.production.
#
# Usage: ./deploy.sh [--force]
#
# Requirements:
#   - gcloud CLI authenticated and configured
#   - Docker installed and configured
#   - Access to the GCP project and Artifact Registry repository
#   - .env.production file with GCP config and Notion secrets
#
# --force: skip git sync check and export tracked files from the working
#          directory instead of origin/main. Useful for hotfixes.
#

set -eo pipefail

# =============================================================================
# CONSTANTS
# =============================================================================

ENV_FILE=".env.production"
TARGET_BRANCH="main"
DOCKER_PLATFORM="linux/amd64"
DOCKERFILE="Dockerfile"
IMAGE_TAG="production"

# Runtime env vars passed to Cloud Run (everything else is deploy config)
RUNTIME_ENV_KEYS=(
    NOTION_CLIENT_ID
    NOTION_CLIENT_SECRET
    NOTION_OAUTH_REDIRECT_URI
    NOTION_OAUTH_STATE_SECRET
)

# Required config keys that must be present in .env.production
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

# =============================================================================
# FUNCTIONS
# =============================================================================

log_info() {
    echo "==> $1" >&2
}

log_error() {
    echo "ERROR: $1" >&2
}

log_warn() {
    echo "WARN: $1" >&2
}

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
        echo "Copy .env.production.example to ${env_file} and fill in the values." >&2
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
            log_error "Missing required key '${key}' in ${env_file}"
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
    local local_sha
    local remote_sha
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

build_image() {
    local tmpdir="$1"
    local image_name="$2"
    local dockerfile="$3"
    local platform="$4"

    log_info "Building Docker image: ${image_name}"
    docker build \
        --platform "$platform" \
        -f "${tmpdir}/${dockerfile}" \
        -t "${image_name}" \
        "$tmpdir"
}

push_image() {
    local image_name="$1"
    log_info "Pushing Docker image: ${image_name}"
    docker push "${image_name}"
}

# Convert selected env keys from .env.production to a JSON object for
# --env-vars-file. Uses Python for robust handling of quotes and special chars.
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
    local service_name="$1"
    local project_id="$2"
    local image_name="$3"
    local region="$4"
    local port="$5"
    local memory="$6"
    local cpu="$7"
    local timeout="$8"
    local concurrency="$9"
    local min_instances="${10}"
    local max_instances="${11}"
    local env_vars_flag="${12}"

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

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local force="false"

    for arg in "$@"; do
        case "$arg" in
            --force) force="true" ;;
            *)
                log_error "Unknown argument: $arg"
                echo "Usage: $0 [--force]" >&2
                exit 1
                ;;
        esac
    done

    log_info "Starting deployment for environment: production"

    load_config "$ENV_FILE"

    local image_name="${GCP_REGISTRY}/${GCP_PROJECT_ID}/${GCP_REPO_NAME}/app:${IMAGE_TAG}"

    verify_git_sync "$TARGET_BRANCH" "$force"

    TMPDIR_SRC=$(export_source "$TARGET_BRANCH" "$force")
    log_info "Source exported to ${TMPDIR_SRC}"

    verify_docker_auth "$GCP_REGISTRY"
    verify_artifact_registry "$GCP_REPO_NAME" "$GCP_REPO_LOCATION" "$GCP_PROJECT_ID"

    build_image "$TMPDIR_SRC" "$image_name" "$DOCKERFILE" "$DOCKER_PLATFORM"
    push_image "$image_name"

    ENV_JSON_FILE=$(prepare_env_vars "$ENV_FILE")
    local env_vars_flag="--env-vars-file=${ENV_JSON_FILE}"

    deploy_cloud_run \
        "$CLOUD_RUN_SERVICE_NAME" \
        "$GCP_PROJECT_ID" \
        "$image_name" \
        "$GCP_REGION" \
        "3000" \
        "$CLOUD_RUN_MEMORY" \
        "$CLOUD_RUN_CPU" \
        "$CLOUD_RUN_TIMEOUT" \
        "$CLOUD_RUN_CONCURRENCY" \
        "$CLOUD_RUN_MIN_INSTANCES" \
        "$CLOUD_RUN_MAX_INSTANCES" \
        "$env_vars_flag"

    log_info "Deployment completed successfully!"
    log_info "Service: ${CLOUD_RUN_SERVICE_NAME}"
    log_info "Image:   ${image_name}"
}

main "$@"