#!/bin/bash

git pull origin Kia-publish --recurse-submodules
python3 compile.py
docker compose -f docker_compose.yaml down
docker compose -f docker_compose.yaml --profile prod up -d --build --force-recreate
