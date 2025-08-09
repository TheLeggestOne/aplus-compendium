#!/bin/bash

CONTAINER_NAME=elder-brain

if docker container exists "$CONTAINER_NAME"; then
    echo "Container $CONTAINER_NAME exists. Starting..."
    docker start elder-brain
else
    echo "Container $CONTAINER_NAME does not exist. Building..."
    ./build.sh
    ./run.sh
fi
