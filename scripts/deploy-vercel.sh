#!/usr/bin/env bash
# Deploy the Apiary App to Vercel.
#
# Requires:
#   VERCEL_TOKEN                 - a Vercel access token (vercel.com/account/tokens)
# Optional (target an existing project non-interactively):
#   VERCEL_ORG_ID, VERCEL_PROJECT_ID   - from your Vercel project's Settings
#
# Usage:
#   VERCEL_TOKEN=... ./scripts/deploy-vercel.sh              # preview deploy (default)
#   VERCEL_TOKEN=... ./scripts/deploy-vercel.sh --prod       # production deploy
#
# Notes:
#   * The app reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at
#     BUILD time. Set those in the Vercel project (Settings -> Environment
#     Variables) to point at your hosted Supabase project, or the deployed site
#     will run in "not configured" mode.
#   * Apply the SQL migrations in supabase/migrations to that hosted Supabase
#     project (e.g. `supabase db push`) so the schema matches.
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN is not set." >&2
  echo "Add it as a Cloud Agent secret (Secrets panel) or export it before running." >&2
  exit 1
fi

TARGET="preview"
case "${1:-}" in
  --prod|--production) TARGET="production" ;;
  "" ) ;;
  * ) echo "Unknown argument: $1 (use --prod for production)" >&2; exit 1 ;;
esac

VERCEL=(npx --yes vercel@latest)

echo "==> Authenticated as:"
"${VERCEL[@]}" whoami --token "$VERCEL_TOKEN"

if [ -n "${VERCEL_ORG_ID:-}" ] && [ -n "${VERCEL_PROJECT_ID:-}" ]; then
  echo "==> Targeting project via VERCEL_ORG_ID / VERCEL_PROJECT_ID"
else
  echo "==> No VERCEL_ORG_ID/VERCEL_PROJECT_ID set; linking project"
  echo "    (available projects:)"
  "${VERCEL[@]}" projects ls --token "$VERCEL_TOKEN" || true
  "${VERCEL[@]}" link --yes --token "$VERCEL_TOKEN"
fi

echo "==> Pulling ${TARGET} environment settings"
"${VERCEL[@]}" pull --yes --environment="$TARGET" --token "$VERCEL_TOKEN"

if [ "$TARGET" = "production" ]; then
  echo "==> Deploying to PRODUCTION"
  "${VERCEL[@]}" deploy --prod --token "$VERCEL_TOKEN"
else
  echo "==> Deploying PREVIEW"
  "${VERCEL[@]}" deploy --token "$VERCEL_TOKEN"
fi
