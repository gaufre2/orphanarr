# tag doc: https://github.com/devcontainers/images/tree/main/src/typescript-node#using-this-image
# 4: image version
# 24: node version (LTS)
# trixie: debian version (13)
FROM mcr.microsoft.com/devcontainers/typescript-node:4-24-trixie

# USERNAME from: https://github.com/devcontainers/images/blob/main/src/javascript-node/.devcontainer/Dockerfile
ARG USERNAME=node

COPY .bun-version /tmp/.bun-version

RUN echo "*** INSTALL Bun ***" \
  && BUN_VERSION=$(cat /tmp/.bun-version) \
  && su ${USERNAME} -c "curl -fsSL https://bun.com/install | bash -s 'bun-v${BUN_VERSION}'"
