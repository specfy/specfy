# ------------------
# package.json cache
# ------------------
FROM alpine:latest as deps

RUN apk add --no-cache bash curl wget jq

# To prevent cache invalidation from changes in fields other than dependencies
COPY prod/clean_package_json.sh /tmp

COPY package.json /tmp
RUN /tmp/clean_package_json.sh /tmp/package.json

COPY pkgs/api/package.json /tmp/api_package.json
RUN /tmp/clean_package_json.sh /tmp/api_package.json

COPY pkgs/app/package.json /tmp/app_package.json
RUN /tmp/clean_package_json.sh /tmp/app_package.json

COPY pkgs/website/package.json /tmp/website_package.json
RUN /tmp/clean_package_json.sh /tmp/website_package.json


# ------------------
# New tmp image
# ------------------
FROM node:18.13.0-bullseye-slim AS tmp

# Setup the app WORKDIR
WORKDIR /app/tmp

RUN mkdir -p ./pkgs/api/
RUN mkdir -p ./pkgs/api/
RUN mkdir -p ./pkgs/website/

# Copy and install dependencies separately from the app's code
# To leverage Docker's cache when no dependency has change
COPY --from=deps /tmp/package.json ./package.json
COPY --from=deps /tmp/api_package.json ./pkgs/api/package.json
COPY --from=deps /tmp/app_package.json ./pkgs/app/package.json
COPY --from=deps /tmp/website_package.json ./pkgs/website/package.json

COPY package-lock.json  ./

# Install every dependencies
RUN true \
  && npm install

# At this stage we copy back all sources and overwrite package(s).json
# This is expected since we already installed the dependencies we have cached what was important
# At this point nothing can be cached anymore
COPY . /app/tmp

ENV GIT_HASH ${git_hash:-dev}

# Build API
RUN true \
  && cd pkgs/api \
  && npm run prod:build \
  && rm -rf src/

# Build APP
RUN true \
  && cd pkgs/app \
  && npm run build -- --assetsDir=${GIT_HASH} \
  && BUCKET_NAME=specfy-app-storage DIR=./dist/ node ../../prod/upload_source_gcs.js \
  && rm -rf src/ \
  && rm -rf dist/

# Build WEBSITE
RUN true \
  && cd pkgs/website \
  && npm run build -- --assetsDir=${GIT_HASH} \
  && BUCKET_NAME=specfy-front-storage DIR=./dist/ node ../../prod/upload_source_gcs.js \
  && rm -rf src/ \
  && rm -rf dist/

# Clean dev dependencies
RUN true \
  && npm prune --omit=dev

# ---- Web ----
# Resulting new, minimal image
# This image must have the minimum amount of layers
FROM node:18.13.0-bullseye-slim as web

ENV PORT=8080
ENV NODE_ENV=production

# Bash is just to be able to log inside the image and have a decent shell
# OpenSSL is here to handle HTTPS requests correctly
RUN true \
  && apt update && apt-get install -y bash curl openssl \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false

# Do not use root to run the app
USER node

WORKDIR /app/specfy

COPY --from=tmp --chown=node:node /app/tmp /app/specfy

EXPOSE 8080
