# science_webapp_template_2024

Template for web application

## Development steps

1. create `secrets.env` file in the root directory with the following content:

select APP_ENV according to your running environment this will effect logging message
```
    # APP_ENV="dev"
    # APP_ENV="pre-prod"
    APP_ENV="dev"
    APP_SECRET_KEY="<ANY RANDOM STRING>"
    APP_MONGO_CONNECTION="mongodb://mongo-service:27017"
    APP_MONGO_DBNAME="<YOUR TEST DB NAME>"
    APP_KAFKA_CONNECTION="kafka:9092"
    APP_ENGINE_WORKERS=1

    APP_DOMAIN="vulcan.webapp"
    MAILERSEND_SENDER_NAME="vulcan"
    MAILERSEND_SENDER_EMAIL="admin@lab.ai"
```

2. run `run_dev.sh` (`chmod +x run_dev.sh` if needed)

## Production deployment

1. `python3 -m venv venv`
2. `source venv/bin/activate`
3. `pip install htmlmin csscompressor rjsmin`
4. run `python3 compile.py` to build web app
5. run `docker compose -f docker_compose.yaml --profile prod up -d --build  --force-recreate` to start the app
