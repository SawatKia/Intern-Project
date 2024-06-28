import logging
from fastapi import APIRouter, FastAPI, Depends, HTTPException, Header, Query, Body, UploadFile, status, Response, Form, Request, File
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Optional, List, Any
import os

from core.services.socket import sio
from core import models
from core.services import database, message_brokers
from . import security

DOMAIN = os.getenv("APP_DOMAIN")
APP_ENV = os.getenv("APP_ENV", "prod")
LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-DiaryRouter"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diary", tags=["diary"])

@router.post("/")
async def create_diary(
    new_diary: models.diaries.New_Diary,
    request: Request
):
    logger.info("Requesting create_diary")
    try:
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
        
        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        db_session = database.get_session()
        
        result = models.diaries.add(db_session, new_diary, user)
        # await sio.emit("new_diary_created", result)
        message_brokers.send_message("emit_message", "new_diary_created", str(result))     
        logger.info("sent message to client, new_diary_created id: %s", result)   
        logger.info("Diary created successfully")
        if isinstance(result, str) and result.startswith("Error"):
            logger.error(f"Error adding diary: {result}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result)
        
        logger.debug(f"Diary created with ID: {result}")
        return JSONResponse(content={"id": result})
    
    except Exception as e:
        logger.error(f"Error in create_diary: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.post("/id/{diary_id}")
async def get_my_diary_id(request: Request, diary_id: str):
    logger.info("Requesting get_my_diary_id")
    try:
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
        
        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        db_session = database.get_session()
        result = models.diaries.get_diary_by_id(db_session, diary_id, user)
        if result is None:
            logger.error("Diary not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary not found")

        logger.debug(f"Diary retrieved: {result}")
        return JSONResponse(content=jsonable_encoder(result))
    except Exception as e:
        logger.error(f"Error in get_my_diary_id: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.post("/my_private")
async def my_private_diaries(request: Request):
    logger.info("Requesting my_private_diaries")
    try:
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        db_session = database.get_session()
        diaries, count = models.diaries.get_private_diaries(db_session, user)
        encoded_diaries = jsonable_encoder({"diaries": diaries, "count": count})

        logger.debug(f"Private diaries retrieved: {encoded_diaries}")
        return JSONResponse(content=encoded_diaries)
    except Exception as e:
        logger.error(f"Error in my_private_diaries: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.post("/my_published")
async def my_published_diaries(request: Request):
    logger.info("Requesting my_published_diaries")
    try:
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        db_session = database.get_session()
        diaries, count = models.diaries.get_published_diaries(db_session, user)
        encoded_diaries = jsonable_encoder({"diaries": diaries, "count": count})

        logger.debug(f"Published diaries retrieved: {encoded_diaries}")
        return JSONResponse(content=encoded_diaries)
    except Exception as e:
        logger.error(f"Error in my_published_diaries: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.post("/publics/{team}")
async def publics_diaries(request: Request, team: str):
    logger.info("Requesting publics_diaries")
    try:
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        db_session = database.get_session()
        diaries, count = models.diaries.get_public_diaries(db_session, team)
        encoded_diaries = jsonable_encoder({"diaries": diaries, "count": count})

        logger.debug(f"Public diaries retrieved: {encoded_diaries}")
        return JSONResponse(content=encoded_diaries)
    except Exception as e:
        logger.error(f"Error in publics_diaries: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.put("/id/{diary_id}")
async def update_diary(diary_id: str, request: Request, diary_data: models.diaries.Edited_Diary):
    logger.info("Requesting update_diary")
    try:
        db_session = database.get_session()
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        result = models.diaries.update(db_session, diary_id, user, diary_data)
        if not result:
            logger.error("Diary not found or not updated")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary not found or not updated")
        
        # await sio.emit("diary_id_updated", diary_id)
        message_brokers.send_message("emit_message", "diary_id_updated", diary_id)
        logger.info("sent message to client, diary_id_updated: %s", diary_id)
        logger.info("Diary updated successfully")
        return JSONResponse(content={"message": "Diary updated successfully"})
    except Exception as e:
        logger.error(f"Error in update_diary: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
        
@router.delete("/id/{diary_id}")
async def delete_diary(diary_id: str, request: Request):
    logger.info("Requesting delete_diary")
    try:
        db_session = database.get_session()
        refresher = request.cookies.get(f"_{DOMAIN}_refresh_token")
        if refresher is None:
            logger.error("Missing refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

        expired, user = security.decode_token(refresher)
        if user is None:
            logger.error("Invalid refresh token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        result = models.diaries.delete(db_session, diary_id, user)
        if not result:
            logger.error("Diary not found or not deleted")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary not found or not deleted")
        
        # await sio.emit("diary_id_deleted", diary_id)
        message_brokers.send_message("emit_message", "diary_id_deleted", diary_id)
        logger.info("sent message to client, diary_id_deleted: %s", diary_id)
        logger.info("Diary deleted successfully")
        return JSONResponse(content={"message": "Diary deleted successfully"})
    except Exception as e:
        logger.error(f"Error in delete_diary: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )