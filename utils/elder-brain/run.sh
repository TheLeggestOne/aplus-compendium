#!/bin/bash

set -a
source ../../.env
set +a

docker run -d \
  --name elder-brain \
  -p $ELDERBRAIN_PORT:$ELDERBRAIN_PORT \
  -v volume-elder-brain:/var/lib/postgresql/data \
  -e POSTGRES_USER=$ELDERBRAIN_USER \
  -e POSTGRES_PASSWORD=$ELDERBRAIN_SECRET \
  -e POSTGRES_DB=$ELDERBRAIN_DATABASE \
  elder-brain
