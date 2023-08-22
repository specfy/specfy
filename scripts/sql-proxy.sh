#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")" || exit
DIR="$(pwd)"

PGSQL_CREDS_PATH=$DIR
PGSQL_CREDS_FILENAME="personal-service-account.json"
GCP_INSTANCE="specfy-prod2:us-central1:specfy-prod2"

echo ""
echo "----"
echo ""
echo "Connecting to $GCP_INSTANCE thru CloudSQL proxy on 127.0.0.1"
echo "Filepath to service account file: $PGSQL_CREDS_PATH/$PGSQL_CREDS_FILENAME"

docker run --rm -v "${PGSQL_CREDS_PATH}":/conf -p 127.0.0.1:5232:5432 \
  gcr.io/cloudsql-docker/gce-proxy:1.27.1 /cloud_sql_proxy \
  -credential_file=/conf/${PGSQL_CREDS_FILENAME} \
  -instances=${GCP_INSTANCE}=tcp:0.0.0.0:5432

# docker run \
#   -v "${PGSQL_CREDS_PATH}/${PGSQL_CREDS_FILENAME}":/conf/${PGSQL_CREDS_FILENAME} \
#   -p 127.0.0.1:3306:3306 \
#   gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.1.2 \
#   --address 0.0.0.0 --port 3306 \
#   --private-ip \
#   --credentials-file "/conf/${PGSQL_CREDS_FILENAME}" ${GCP_INSTANCE}
