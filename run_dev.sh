#!/bin/bash

docker compose -f docker_compose.yaml down
python3 compile.py
docker compose -f docker_compose.yaml --profile dev up -d --build --force-recreate