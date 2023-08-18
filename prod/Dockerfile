# ------------------
# package.json cache
# ------------------
FROM node:18.16.1-bullseye-slim as deps

RUN apt update && apt-get install -y bash jq

WORKDIR /tmp

# Copy all the package.json
COPY prod/clean_package_json.sh package.json ./
COPY pkgs/api/package.json ./pkgs/api/package.json
# COPY pkgs/app/package.json ./pkgs/app/package.json
COPY pkgs/core/package.json ./pkgs/core/package.json
COPY pkgs/db/package.json ./pkgs/db/package.json
COPY pkgs/github/package.json ./pkgs/github/package.json
COPY pkgs/github-sync/package.json ./pkgs/github-sync/package.json
COPY pkgs/models/package.json ./pkgs/models/package.json
COPY pkgs/socket/package.json ./pkgs/socket/package.json


RUN ./clean_package_json.sh './package.json'
RUN ./clean_package_json.sh './**/*/package.json'

# ------------------
# New tmp image
# ------------------
FROM node:18.16.1-bullseye-slim AS tmp

# Setup the app WORKDIR
WORKDIR /app/tmp

# Copy and install dependencies separately from the app's code
# To leverage Docker's cache when no dependency has change
COPY --from=deps /tmp ./
COPY package-lock.json  ./

# Install every dependencies
RUN true \
  && npm install

# At this stage we copy back all sources and overwrite package(s).json
# This is expected since we already installed the dependencies we have cached what was important
# At this point nothing can be cached anymore
COPY . /app/tmp

RUN ls -lah ./node_modules/

ARG git_hash
ENV GIT_HASH ${git_hash:-dev}

# /!\ It's counter intuitive but do not set NODE_ENV=production before building, it will break some modules
# ENV NODE_ENV=production

# Build
RUN true \
  && npx turbo run build --ignore app

# Clean src
RUN true \
  && rm -rf pkgs/*/src

# Clean dev dependencies
RUN true \
  && npm prune --omit=dev --omit=peer

# RUN du -h -d1 node_modules/ | sort -h
# RUN du -h -d1 pkgs/ | sort -h
# RUN du -h -d1 pkgs/emails/node_modules/ | sort -h

# ---- Web ----
# Resulting new, minimal image
# This image must have the minimum amount of layers
FROM node:18.16.1-bullseye-slim as web

ENV PORT=8080
ENV NODE_ENV=production

# - Bash is just to be able to log inside the image and have a decent shell
# - OpenSSL is here to handle HTTPS + git clone requests correctly
# - Git is to be able to clone repositories
RUN true \
  && apt update && apt-get install -y bash openssl git ca-certificates \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false

# Do not use root to run the app
USER node

WORKDIR /app/specfy

# Code
COPY --from=tmp --chown=node:node /app/tmp /app/specfy

EXPOSE 8080
