#!/usr/bin/env bash
# One-time repository bootstrap for the Apiary App Cloud Agent environment.
# Runs after checkout; must be idempotent and must terminate.
# Docker images and the Supabase CLI are expected to live on the environment
# snapshot. Per-boot stack startup belongs in start.sh.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

SUPABASE_CLI_VERSION="2.114.0"

echo "==> Installing system packages (Docker + fuse-overlayfs for the Supabase local stack)"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq \
  -o Dpkg::Options::=--force-confdef \
  -o Dpkg::Options::=--force-confold \
  docker.io iptables fuse-overlayfs uidmap
sudo groupadd -f docker
sudo usermod -aG docker "$(id -un)" || true

echo "==> Ensuring Supabase CLI ${SUPABASE_CLI_VERSION} is installed"
if [ "$(supabase --version 2>/dev/null || true)" != "${SUPABASE_CLI_VERSION}" ]; then
  tmp_deb="$(mktemp --suffix=.deb)"
  curl -fsSL -o "${tmp_deb}" \
    "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_${SUPABASE_CLI_VERSION}_linux_amd64.deb"
  sudo dpkg -i "${tmp_deb}"
  rm -f "${tmp_deb}"
fi

echo "==> Installing npm dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "==> Install complete"
