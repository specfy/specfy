# ------------------
# package.json cache
# ------------------
FROM alpine:latest as deps

RUN apk add --no-cache bash jq

WORKDIR /tmp

# Copy all the package.json
COPY prod/clean_package_json.sh package.json ./
COPY pkgs/api/package.json ./pkgs/api/package.json
COPY pkgs/emails/package.json ./pkgs/emails/package.json

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

ARG git_hash
ENV GIT_HASH ${git_hash:-dev}
ENV NODE_ENV=production

# Build API
RUN true \
  && cd pkgs/api \
  && npm run prod:build

# Clean src
RUN true \
  && rm -rf pkgs/*/src

# Clean dev dependencies
RUN true \
  && npm prune --omit=dev

# ---- Web ----
# Resulting new, minimal image
# This image must have the minimum amount of layers
FROM node:18.16.1-bullseye-slim as web

ENV PORT=8080
ENV NODE_ENV=production

# - Bash is just to be able to log inside the image and have a decent shell
# - OpenSSL is here to handle HTTPS requests correctly
# - Git is to be able to clone repositories
RUN true \
  && apt update && apt-get install -y bash openssl git \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false

# Do not use root to run the app
USER node

WORKDIR /app/specfy

COPY --from=tmp --chown=node:node /app/tmp /app/specfy

EXPOSE 8080
