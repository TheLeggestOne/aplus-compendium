#!/bin/bash

CONTAINER_NAME=gelatinous-cube

if docker container exists "$CONTAINER_NAME"; then
    echo "Container $CONTAINER_NAME exists. Starting..."
    docker start gelatinous-cube
else
    echo "Container $CONTAINER_NAME does not exist. Building..."
    ./build.sh
    ./run.sh
fi
