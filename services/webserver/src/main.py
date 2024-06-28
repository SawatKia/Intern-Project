from fastapi import APIRouter, FastAPI, BackgroundTasks, Depends, HTTPException, Header, Query, Body, UploadFile, status, Response, Form, Request, File, WebSocket
from fastapi.responses import JSONResponse
from starlette.datastructures import Headers
from starlette.types import Message
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import socketio
import uuid
import time
import asyncio

import logging
from pathlib import Path
import asyncio
import os
from os.path import dirname
from contextlib import asynccontextmanager
import sys


dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, "../.."))
sys.path.append(os.path.join(dir_path, ".."))

from core.services.socket import sio
from utils.serve_react import serve_react_app
from core import models
from core.services import database, message_brokers

from routes import security, user, Diary


dir_path = os.path.dirname(os.path.realpath(__file__))
APP_ENV = os.getenv("APP_ENV")

LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-mainRouter"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
REQUEST_TOPIC = "request_topic"
RESPONSE_TOPIC = "response_topic"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load
    logger.debug("Webserver is starting up.")
    database.initialize()
    models.initialize(database.get_session())
    message_brokers.initialize()
    with message_brokers.get_admin_session() as admin_session:
        message_brokers.create_topic(admin_session, REQUEST_TOPIC)
        message_brokers.create_topic(admin_session, RESPONSE_TOPIC)
        message_brokers.create_topic(admin_session, "emit_message")
    yield
    # Clean up
    logger.info("Webserver is exiting, Wait a moment until completely exits.")
    database.terminate()

app = FastAPI(
    lifespan=lifespan,
    title="Vulcan Webapp",
    description="Vulcan Webapp Api testing Documentation",
    version="1.0.0",
)
app.mount('/socket.io', socketio.ASGIApp(sio, app))

# Kafka consumer background task
async def kafka_listener():
    consumer = message_brokers.Consumer("emit_message")
    while True:
        for message in consumer(["emit_message"]):
            topic, key, value = message
            logger.info(f"Received message from Kafka: {value}")
            await sio.emit(key, value)
        break
        
#NOTE - (start) Kafka topic sent testing
# async def process_kafka_messages(unique_key: str):
#     req_consumer = message_brokers.Consumer(REQUEST_TOPIC)
#     res_consumer = message_brokers.Consumer(RESPONSE_TOPIC)
    
#     request_processed = False
#     response_processed = False
    
#     while not (request_processed and response_processed):
#         for _, key, value in req_consumer([REQUEST_TOPIC]):
#             if key == unique_key:
#                 logger.debug(f"Processing request: {value}")
#                 request_processed = True
#                 break
        
#         for _, key, value in res_consumer([RESPONSE_TOPIC]):
#             if key == unique_key:
#                 logger.debug(f"Processing response: {value}")
#                 response_processed = True
#                 break
    
#     req_consumer.stop_consume()
#     res_consumer.stop_consume()

# @app.middleware("http")
# async def kafka_middleware(request: Request, call_next):
    unique_key = str(uuid.uuid4())
    serialized_request = {
        "method": request.method,
        "url": str(request.url),
        "headers": dict(request.headers),
        "body": (await request.body()).decode()
    }
    
    message_brokers.send_message(REQUEST_TOPIC, unique_key, serialized_request)
    
    response = await call_next(request)
    
    serialized_response = {
        "status_code": response.status_code,
        "headers": dict(response.headers)
    }
    # If the response is StreamingResponse, we can't access its body directly
    if isinstance(response, StreamingResponse):
        serialized_response["body"] = "Streaming content"
    else:
        serialized_response["body"] = response.body.decode() if response.body else None
    
    message_brokers.send_message(RESPONSE_TOPIC, unique_key, serialized_response)
    
    background_tasks = BackgroundTasks()
    background_tasks.add_task(process_kafka_messages, unique_key)
    response.background = background_tasks
    return response
# #NOTE - (end) Kafka topic sent testing

# to catch some request that doesn't hit any route
@app.middleware("http")
async def log_all_requests_middleware(request: Request, call_next):
    logger.info("incoming request")
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    if request.url.path in ["/api/v1/diary/", "/api/v1/diary/id/{diary_id}", "/api/v1/diary/my_private"]:
        await kafka_listener()
    logger.info(f"with response: {response.status_code} {request.url}")
    return response

router = APIRouter(prefix="/api/v1")
router.include_router(security.router)
router.include_router(user.router)
router.include_router(Diary.router)
# router.include_router(message_brokers.router)

app.include_router(router)

@app.get("/test_message")
async def test_message():
    message_brokers.send_message("test_topic", "test_key", {"test": "test"})
    return {"message": "Message sent."}

@app.get("/api/v1/ping")
async def ping():
    return {"status": "ok"}

# Mount the React app
serve_react_app(app, "react_build")

if __name__ == '__main__':
    import uvicorn
    workers = int(os.getenv("APP_ENGINE_WORKERS", 1))
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", workers=workers)
    # Start Kafka listener in the background
    asyncio.create_task(kafka_listener())