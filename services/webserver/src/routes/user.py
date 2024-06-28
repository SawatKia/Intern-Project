import logging
import os
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request, Body
from typing import List, Optional

from core import models
from core.services import database
from . import security

# Set up the logging configuration based on environment
DOMAIN = os.getenv("APP_DOMAIN")
APP_ENV = os.getenv("APP_ENV", "prod")
LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-UserRouter"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/manage", tags=["user"])
def normalize_email(email):
    logger.info("Normalizing email")
    local_part, domain_part = email.rsplit('@', 1)
    return f"{local_part.lower()}@{domain_part.lower()}"


@router.post("/user", status_code=status.HTTP_201_CREATED)
async def register(new_user: models.users.New_User):
    logger.info("requesting registration")
    logger.debug("registering with new_user: %s", new_user)
    if new_user.password == "" or new_user.confirm_password == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirmation password cannot be empty"
        )
    db_session = database.get_session()
    try:
        logger.info("Registering a new user")
        duplicate_username = models.users.get_users(db_session, "username", new_user.username, "asc")
        logger.debug(f"Duplicate username: {duplicate_username}")
        duplicate_email = models.users.get_users(db_session, "email", new_user.email, "asc")
        logger.debug(f"Duplicate email: {duplicate_email}")
        if duplicate_username:
            logger.debug(f"Duplicate username found: {new_user.username}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username already exists: {new_user.username}"
            )
        if duplicate_email:
            logger.debug(f"Duplicate email found: {new_user.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email already exists: {new_user.email}"
            )
        new_user.email = normalize_email(new_user.email)
        new_user.username = new_user.username.lower()
        user_id = models.users.add(db_session, new_user, models.users.User_Type.Client)
        if user_id:
            logger.info(f"User registered successfully with user_id={user_id}")
            return {"status": "success", "message": "User registered successfully", "user_id": user_id}
        else:
            logger.error("Failed to register user")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register user"
            )
    except HTTPException as e:
        logger.error(f"HTTPException occurred while registering user: {str(e.detail)}")
        raise e
    except Exception as e:
        logger.error(f"Exception occurred while registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/current_user", status_code=status.HTTP_200_OK)
async def get_current_user(request: Request):
    logger.info("requesting get current user")
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
        
        return {"status": "success", "data": user}
    except Exception as e:
        logger.error(f"Exception occurred while fetching user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching current user"
        )

#Not yet test
@router.get("/users", status_code=status.HTTP_200_OK)
async def get_users(
    search_criteria: str = Query(..., description="Criteria to search by: 'username' or 'email'"),
    search_value: str = Query(..., description="Value to search for"),
    order: str = Query(..., description="Sort order: 'asc' for ascending, 'desc' for descending"),
    is_admin: bool = Depends(security.check_is_admin)
):
    logger.info("requesting get users")
    try:
        logger.info("Fetching users")
        if search_criteria not in {"username", "email"}:
            logger.debug(f"Invalid search criteria: {search_criteria}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid search criteria. Must be 'username' or 'email'."
            )
        if order.lower() not in {"asc", "desc"}:
            logger.debug(f"Invalid sort order: {order}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid sort order. Must be 'asc' or 'desc'."
            )
        order = order.lower()
        db_session = database.get_session()
        users = models.users.get_users(db_session, search_criteria, search_value, order)
        if not users:
            logger.info("No users found")
            return {"status": "success", "message": "No users found", "data": []}
        logger.debug(f"Users found: {users}")
        return {"status": "success", "data": users}
    except Exception as e:
        logger.error(f"Exception occurred while fetching users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/user/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_by_id(user_id: str, is_admin: bool = Depends(security.check_is_admin)):
    logger.info("requesting get user by id")
    try:
        logger.info(f"Fetching user by id: {user_id}")
        db_session = database.get_session()
        user = models.users.get_by_id(db_session, user_id)
        if not user:
            logger.debug("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        logger.debug(f"User found: {user}")
        return {"status": "success", "data": user}
    except Exception as e:
        logger.error(f"Exception occurred while fetching user by id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/user", status_code=status.HTTP_200_OK)
async def update_user(user_data: models.users.Edited_User_Data, current_user: models.users.User = Depends(security.get_active_current_user)):
    logger.info("requesting update user")
    try:
        logger.info(f"Updating user with id: {current_user.id}")
        db_session = database.get_session()
        if user_data.email:
            user_data.email = normalize_email(user_data.email)
        if user_data.username:
            user_data.username = user_data.username.lower()
        updated = models.users.update(db_session, current_user.id, user_data)
        if updated:
            logger.info("User updated successfully")
            return {"status": "success", "message": "User updated successfully"}
        else:
            logger.error("Failed to update user")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )
    except Exception as e:
        logger.error(f"Exception occurred while updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/user", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str, is_admin: bool = Depends(security.check_is_admin)):
    logger.info("requesting delete user")
    try:
        logger.info(f"Deleting user with id: {user_id}")
        db_session = database.get_session()
        deleted = models.users.delete_user(db_session, user_id)
        if deleted:
            logger.info("User deleted successfully")
            return {"status": "success", "message": "User deleted successfully"}
        else:
            logger.info("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except Exception as e:
        logger.error(f"Exception occurred while deleting user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
# @router.get("")
# async def get_user(search: str = Query(None), limit:int = Query(100), page:int = Query(1), sort: str = Query(None), order: str = Query(None), is_admin: bool = Depends(security.check_is_admin)):
#     db_session = database.get_session()
#     return models.users.get(db_session, search, limit, page, sort, order)