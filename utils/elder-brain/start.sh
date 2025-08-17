#!/bin/bash


CONTAINER_NAME=elder-brain

if [ "$(docker ps -a -q -f name=^${CONTAINER_NAME}$)" ]; then
    echo "Container $CONTAINER_NAME exists. Starting..."
    docker start "$CONTAINER_NAME"
else
    echo "Container $CONTAINER_NAME does not exist. Building..."
    ./build.sh
    ./run.sh
fi
