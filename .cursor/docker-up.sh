#!/usr/bin/env bash
# Idempotently start the Docker daemon in the nested Cloud Agent VM.
#
# Notes on the nested-container environment:
#   * The kernel does not allow native overlay2 in this user namespace, so the
#     daemon uses the fuse-overlayfs storage driver.
#   * The legacy iptables FORWARD chain has a DROP policy. With
#     bridge-nf-call-iptables enabled, same-bridge container-to-container frames
#     traverse that chain and get dropped, which breaks Supabase's inter-service
#     networking. Disabling bridge-nf-call-iptables lets same-bridge traffic flow
#     at L2, which is what the Supabase stack needs.
set -euo pipefail

sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true

if sudo docker info >/dev/null 2>&1; then
  sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
  exit 0
fi

echo "==> Starting Docker daemon"
sudo mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
  echo '{ "storage-driver": "fuse-overlayfs" }' | sudo tee /etc/docker/daemon.json >/dev/null
fi

sudo nohup dockerd >/tmp/dockerd.log 2>&1 &

for _ in $(seq 1 60); do
  if sudo docker info >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! sudo docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon failed to start" >&2
  tail -n 40 /tmp/dockerd.log >&2 || true
  exit 1
fi

sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
echo "==> Docker daemon ready"
