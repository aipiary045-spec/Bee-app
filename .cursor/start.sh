#!/usr/bin/env bash
# Per-boot startup for the Apiary App Cloud Agent environment.
# Prefers hosted Supabase secrets when they are set; otherwise starts the local
# Docker stack and writes .env.local from it.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"
DOCKER_UP="${REPO_DIR}/.cursor/docker-up.sh"

log() {
  echo "==> $*"
}

write_env_local() {
  local url="$1"
  local anon="$2"
  umask 077
  cat > "${REPO_DIR}/.env.local" <<EOF
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
NEXT_PUBLIC_DEFAULT_LOCATION=Agra, OK
NEXT_PUBLIC_DEFAULT_LAT=35.8942
NEXT_PUBLIC_DEFAULT_LON=-96.8714
EOF
}

hosted_ready() {
  [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || return 1
  [ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ] || return 1
  case "${NEXT_PUBLIC_SUPABASE_URL}" in
    http://*|https://*) ;;
    *) return 1 ;;
  esac
  case "${NEXT_PUBLIC_SUPABASE_URL}${NEXT_PUBLIC_SUPABASE_ANON_KEY}" in
    *your-project*|*YOUR_ANON*|*placeholder*|*changeme*) return 1 ;;
  esac
  return 0
}

ensure_local_supabase() {
  bash "${DOCKER_UP}"
  if supabase status >/dev/null 2>&1; then
    log "Supabase already running"
    return 0
  fi
  supabase stop --no-backup >/dev/null 2>&1 || true
  supabase start
}

if hosted_ready; then
  write_env_local "${NEXT_PUBLIC_SUPABASE_URL}" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
  log "Wrote .env.local from hosted Supabase secrets. Skipping local Docker stack."
  exit 0
fi

log "Hosted secrets not set. Starting local Supabase."
ensure_local_supabase

log "Writing .env.local from the running local Supabase stack"
eval "$(supabase status -o env)"
write_env_local "${API_URL}" "${ANON_KEY}"
log "Environment ready (Studio: http://localhost:54323, App: http://localhost:3000)"
