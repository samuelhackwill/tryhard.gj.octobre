#!/bin/bash

# Base Docker image
IMAGE="fn61/screen-server:20240418_1823_00ddd6ec"

# Base URL of the domain (can be updated if needed)
BASE_URL="https://tryhard.samuel.ovh"

# HTTP port starts from 80 and increments for each detected device
HTTP_PORT=80

# Loop through each mouse device in /dev/input/by-id
for MOUSE_EVENT in /dev/input/by-id/*-event-mouse; do
    if [[ -e "$MOUSE_EVENT" ]]; then
        # Define a unique Docker container name based on the HTTP port
        CONTAINER_NAME="screen-server-$HTTP_PORT"

        # Construct and run the Docker command for each mouse device
        DOCKER_CMD="sudo docker run -d --name $CONTAINER_NAME -p $HTTP_PORT:80 --shm-size 512m --security-opt seccomp=unconfined -e \"SCREEN_1=5900,800,1280,Galaxy Tab $HTTP_PORT,$MOUSE_EVENT\" --device $MOUSE_EVENT $IMAGE"

        echo "Running command: $DOCKER_CMD"
        eval "$DOCKER_CMD"

        # Increment HTTP port for the next container
        ((HTTP_PORT++))
    fi
done


