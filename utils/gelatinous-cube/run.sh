#!/bin/bash

set -a
source ../../.env
set +a

docker run -d \
  --name $GELATINOUS_CUBE_HOST \
  -p 9000:9000 \
  -p 9001:9001 \
  -v volume-gelatinous-cube:/data \
  -e MINIO_ROOT_USER=$GELATINOUS_CUBE_USER \
  -e MINIO_ROOT_PASSWORD=$GELATINOUS_CUBE_PASSWORD \
  $GELATINOUS_CUBE_HOST
