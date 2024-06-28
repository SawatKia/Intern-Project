import logging
from fastapi import APIRouter, FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import Optional, Dict
import jwt
from datetime import datetime, timedelta
import pytz
import os
import sys
import json

# Set up the logging configuration based on environment
APP_ENV = os.getenv("APP_ENV", "prod")
LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-SecurityRouter"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)
logger.debug("APP_ENV: %s", APP_ENV)

dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, "..", ".."))

from core.models import users, Token
from core.services import database


router = APIRouter(prefix="/authen", tags=["security"])

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60 * 2
REFRESH_TOKEN_EXPIRE_MINUTES = 24 * 60 * 2
DOMAIN = os.getenv("APP_DOMAIN")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = timedelta(minutes=15)):
    SECRET_KEY = os.getenv("APP_SECRET_KEY")
    expire = datetime.now(tz=pytz.utc) + expires_delta
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug("Access token created: %s", encoded_jwt)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = timedelta(minutes=30)):
    token = create_access_token(data=data, expires_delta=expires_delta)
    logger.debug("Refresh token created: %s", token)
    return token

def create_tokens(user: users.User):
    user_data = users.User.serialize(user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=user_data, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data=user_data, expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES))
    logger.debug("Tokens created for user: %s", user.username)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"Authorization": "Bearer"},
)

def decode_token(token: str):
    logger.info("decoding token")
    SECRET_KEY = os.getenv("APP_SECRET_KEY")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        expired = datetime.now(tz=pytz.utc) > datetime.fromtimestamp(exp).astimezone(pytz.utc)
        logger.debug("Token decoded: %s", payload)
    except jwt.DecodeError:
        logger.error("Token decode error")
        raise credentials_exception
    except jwt.ExpiredSignatureError:
        logger.error("Token expired")
        raise credentials_exception
    except jwt.InvalidTokenError:
        logger.error("Invalid token")
        raise credentials_exception
    return expired, users.User.deserialize(payload)

def create_token_response(user: users.User):
    logger.info("creating token response")
    tokens = create_tokens(user)
    response = JSONResponse(status_code=status.HTTP_200_OK, content=users.User.serialize(user))
    
    # secure_flag = False if APP_ENV == "dev" else True
    # logger.debug("secure_flag: %s", secure_flag)
    # same_site_flag = "None" if APP_ENV == "dev" else "Strict"
    # logger.debug("same_site_flag: %s", same_site_flag)
    
    # response.set_cookie(f"_{DOMAIN}_access_token", tokens.access_token, httponly=True, secure=secure_flag, samesite=same_site_flag)
    # response.set_cookie(f"_{DOMAIN}_refresh_token", tokens.refresh_token, httponly=True, secure=secure_flag, samesite=same_site_flag)
    response.set_cookie(f"_{DOMAIN}_access_token", tokens.access_token, httponly=True, secure=True, samesite="Strict")
    response.set_cookie(f"_{DOMAIN}_refresh_token", tokens.refresh_token, httponly=True, secure=True, samesite="Strict")
    logger.debug("Token response created for user: %s with status code: %s, headers: %s, body: %s",
                 user.username, response.status_code, response.headers, response.body)
    return response

@router.post('/refresh')
async def refresh_token(request: Request):
    logger.info("requesting Refresh token")
    request_str = json.dumps(dict(request.cookies), indent=4)  # Serialize cookies to a string
    logger.debug("Request cookies: %s", request_str)
    try:  
        token: str = request.cookies.get(f"_{DOMAIN}_refresh_token")
        logger.debug(f"get cookies_{DOMAIN}_refresh_token: %s", token)
        if not token:
            logger.error("Refresh token not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token was not found",
                headers={"WWW-Authenticate": "Bearer"},
            )    
        expired, user = decode_token(token)
        logger.debug("Token verified: %s, Expired: %s, User: %s", token, expired, user)
        
        db_session = database.get_session()
        user = users.get_by_id(db_session, user_id=user.id)
        if user is not None:
            logger.debug("User found for refresh token")
            return create_token_response(user)
        
        logger.error("User not found during refresh")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except HTTPException as http_exc:
        # Log the HTTPException details and re-raise it
        logger.error(f"HTTPException during token refresh: {str(http_exc)}")
        raise http_exc
    
    except Exception as e:
        # Log the general exception details
        logger.error(f"Unexpected error during token refresh: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )



@router.post("/login")
async def login(form_data: users.LoginForm):
    logger.info("Requesting login for username input: %s", form_data.username)
    try:    
        if not (form_data.username and form_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required",
            )
        
        result, user = users.check_password(database.get_session(), form_data.username.lower(), form_data.password)
        logger.debug("Login result: %s, User: %s", result, user)
        
        if result:
            logger.debug("User authenticated: %s", form_data.username)
            return create_token_response(user)
        
        logger.error("Login failed for user: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except HTTPException as http_exc:
        # Re-raise the HTTPException directly
        raise http_exc
    
    except Exception as e:
        # Log the exception details
        logger.error(f"Unexpected error during login: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )


    
@router.post("/verify")
async def verify(request: Request):
    logger.info("requesting verifying")
    try:
        response = JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content="Invalid credentials")
        user = await verify_credentials(request)
        if user:
            response = JSONResponse(status_code=status.HTTP_200_OK, content=users.User.serialize(user))
        return response

    except HTTPException as http_exc:
        # Log the HTTPException details and re-raise it
        logger.error(f"HTTPException during verify: {str(http_exc)}")
        raise http_exc

    except Exception as e:
        # Log the general exception details
        logger.error(f"Unexpected error during verify: {str(e)}")
        # Extract the original status code if available, otherwise use 500
        status_code = getattr(e, 'status_code', status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Raise a new HTTPException with the original status code and error message
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )


    
@router.post("/logout")
async def logout(request: Request):
    logger.info("requesting Logout")
    response = JSONResponse(status_code=status.HTTP_200_OK, content="OK")
    response.delete_cookie(f"_{DOMAIN}_access_token")
    response.delete_cookie(f"_{DOMAIN}_refresh_token")
    return response

async def check_token(request: Request):
    logger.info("Checking access token")
    request_str = json.dumps(dict(request.cookies), indent=4)  # Serialize cookies to a string
    logger.debug("Request cookies: %s", request_str)
    try:
        token: str = request.cookies.get(f"_{DOMAIN}_access_token")
        logger.debug(f"get cookies_{DOMAIN}_access_token: %s", token)
        if not token:
            logger.error("Access token not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token was not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        expired, user = decode_token(token)
        logger.debug("Token verified: %s, Expired: %s, User: %s", token, expired, user)
        if expired:
            response = JSONResponse(status_code=status.HTTP_200_OK, content="OK")
            response.delete_cookie(f"_{DOMAIN}_access_token")
            logger.info("Token expired during check")
            return response
    except HTTPException:
        logger.error("Token validation failed during check")
        pass

async def verify_credentials(request: Request):
    logger.info("Verifying credential")
    request_str = json.dumps(dict(request.cookies), indent=4)  # Serialize cookies to a string
    logger.debug("Request cookies: %s", request_str)
    try:
        token: str = request.cookies.get(f"_{DOMAIN}_access_token")
        logger.debug(f"get cookies_{DOMAIN}_access_token: %s", token)
        if not token:
            logger.error("Access token not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token was not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        expired, user = decode_token(token)
        logger.debug("Token verified: %s, Expired: %s, User: %s", token, expired, user)
        if expired:
            logger.info("Token expired for user: %s", user.username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except HTTPException:
        logger.error("Invalid credentials during verify")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )    
    logger.debug("Credentials verified for user: %s", user.username)
    return user 

async def get_active_current_user(user: users.User = Depends(verify_credentials)):
    if not user.activated and user.user_type != users.User_Type.Admin:
        logger.info("Inactive user attempted access: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user.",
            headers={"username": user.username},
        )
    return user

async def check_is_admin(user: users.User = Depends(verify_credentials)):
    if not user.user_type == users.User_Type.Admin:
        logger.info("Non-admin user attempted admin access: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an admin.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user.user_type == users.User_Type.Admin

async def get_admin(user: users.User = Depends(verify_credentials)):
    if not user.user_type == users.User_Type.Admin:
        logger.info("Non-admin user attempted access: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an admin.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
