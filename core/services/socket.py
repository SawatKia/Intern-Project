import os
import logging
import socketio

APP_ENV = os.getenv("APP_ENV")

LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-mainRouter"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
sio = socketio.AsyncServer(logger=True, async_mode='asgi', cors_allowed_origins='*')

@sio.on("connect")
async def connect(sid, environ):
    logger.info(f"New Client Connected: {sid}")

@sio.on("message")
async def message(sid, data):
    logger.info(f"Server Received a message from client: {data}")

@sio.on("disconnect")
async def disconnect(sid):
    logger.info(f"Client Disconnected: {sid}")
    
@sio.event
async def connect_error(sid, error):
    logger.error(f"Socket connection error for SID {sid}: {error}")

