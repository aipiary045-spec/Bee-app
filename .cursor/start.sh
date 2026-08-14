#!/usr/bin/env bash
# Per-boot startup for the Apiary App Cloud Agent environment.
# Brings up Docker + the local Supabase stack and writes .env.local, then returns.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> Ensuring Docker is running"
bash "${REPO_DIR}/.cursor/docker-up.sh"

echo "==> Ensuring the local Supabase stack is running"
if supabase status >/dev/null 2>&1; then
  echo "==> Supabase already running"
else
  supabase start
fi

echo "==> Writing .env.local from the running Supabase stack"
# supabase status -o env emits KEY="value" lines (API_URL, ANON_KEY, ...).
eval "$(supabase status -o env)"
cat > "${REPO_DIR}/.env.local" <<EOF
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
NEXT_PUBLIC_DEFAULT_LOCATION=Agra, OK
NEXT_PUBLIC_DEFAULT_LAT=35.8942
NEXT_PUBLIC_DEFAULT_LON=-96.8714
EOF

echo "==> Environment ready (Studio: http://localhost:54323, App: http://localhost:3000)"
