from fastapi import APIRouter, FastAPI, Depends, HTTPException, Header, Query, Body, UploadFile, status, Response, Form, Request, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

import sys
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, ".."))

from core import models
from core.services import database, notification


dir_path = os.path.dirname(os.path.realpath(__file__))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load
    print("Management is starting up.")
    database.initialize()
    models.initialize(database.get_session())
    yield
    # Clean up
    print("Management is exiting.", "Wait a moment until completely exits.")
    database.terminate()


app = FastAPI(
    lifespan=lifespan,
    title="Vulcan Webapp",
    description="Vulcan Webapp",
    version="0.1.0",
)
router = APIRouter(prefix="/api/v1")

app.include_router(router)

if __name__ == '__main__':
    import uvicorn
    workers = int(os.getenv("MANAGEMENT_ENGINE_WORKERS", 1))
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", workers=workers)