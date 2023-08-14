#!/usr/bin/env bash

set -e

ENV=$1 # can be "prod" or "staging"
COMMAND=$2
ARGS=${@:3}

USAGE="./terraform.sh <prod | staging> [args...]"

if [ "$ENV" != "prod" ] && [ "$ENV" != "staging" ]; then
  echo "$USAGE"
  exit
fi

LAST_COMMIT_HASH=$(git rev-parse HEAD)

set -ex

terraform workspace select "$ENV"
# shellcheck disable=SC2086
terraform "$COMMAND" -var-file=env/"$ENV".tfvars -var="docker_image_version=$LAST_COMMIT_HASH" $ARGS
