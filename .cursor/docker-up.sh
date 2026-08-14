#!/usr/bin/env bash
# Idempotently start the Docker daemon in the nested Cloud Agent VM and make the
# socket usable by the (non-root) run user.
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

RUN_GROUP="$(id -gn)"

# Make the daemon socket usable by the run user without sudo. dockerd can race
# and recreate the socket during startup, so poll until a non-sudo `docker info`
# actually works rather than chmod'ing once.
ensure_socket_access() {
  for _ in $(seq 1 30); do
    if docker info >/dev/null 2>&1; then
      return 0
    fi
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    sleep 1
  done
  docker info >/dev/null 2>&1
}

sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true

if sudo docker info >/dev/null 2>&1; then
  ensure_socket_access
  exit 0
fi

echo "==> Starting Docker daemon"
sudo mkdir -p /etc/docker
# Own the socket by the run user's group so it is reachable without sudo, and use
# fuse-overlayfs since native overlay2 is unavailable in this user namespace.
printf '{ "storage-driver": "fuse-overlayfs", "group": "%s" }\n' "${RUN_GROUP}" \
  | sudo tee /etc/docker/daemon.json >/dev/null

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

if ! ensure_socket_access; then
  echo "ERROR: Docker socket is not accessible to $(id -un)" >&2
  exit 1
fi

echo "==> Docker daemon ready"
