import logging
import os
from pymongo import DESCENDING, ASCENDING
from datetime import datetime
from bson.objectid import ObjectId
from bson import json_util
import bcrypt
from pydantic import BaseModel, validator
from typing import Optional, List, Any
from . import base
from enum import Enum
import pytz


# Set up the logging configuration based on environment
APP_ENV = os.getenv("APP_ENV", "prod")
LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-usersMoodel"] else logging.INFO
logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class LoginForm(BaseModel):
    username: str
    password: str
    
class User_Type(str, Enum):
    Client = "client"
    Admin = "admin"

class User_Data(BaseModel):
    username: str
    email: str
    
    @validator('username')
    def username_not_empty(cls, value):
        if not value or value.strip() == "":
            raise ValueError('Username cannot be empty or null')
        return value

    @validator('email')
    def email_not_empty(cls, value):
        if not value or value.strip() == "":
            raise ValueError('Email cannot be empty or null')
        return value

class New_User(User_Data):
    password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, value, values):
        if 'password' in values and value != values['password']:
            raise ValueError('Passwords do not match')
        return value

    @classmethod
    def required_arguments_not_empty(cls, **kwargs):
        for key, value in kwargs.items():
            if not value:
                raise ValueError(f"{key} is required")

class Edited_User_Data(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class User(base.Mongo_Object, User_Data):
    user_type: User_Type
    member_since: datetime
    activated: Optional[bool] = False

    @staticmethod
    def serialize(user):
        d = user.dict()
        d["member_since"] = user.member_since.isoformat()
        # d["user_type"] = d["user_type"].value
        # d["permissions"] = "".join([p.value for p in d["permissions"]])
        return d

    @staticmethod
    def deserialize(obj):
        obj["member_since"] = datetime.fromisoformat(obj["member_since"])
        # obj["user_type"] = User_Type(obj["user_type"])
        # obj["permissions"] = [User_Permission(p) for p in obj["permissions"]]
        return User(**obj)

class User_Record(User):
    hashpwd: str


def initialize(db_session):
    try:
        logger.info("Initializing user collection")
        user_db = db_session.get_collection("users")
        user_db.create_index([("username", ASCENDING)], unique=True)
        user_db.create_index([("email", ASCENDING)], unique=True)
    except Exception as e:
        logger.error(f"Error initializing user collection: {str(e)}")


def activate_user(db_session, user_id):
    logger.info(f"Activating user with id: {user_id}")
    user_db = db_session.get_collection("users")
    result = user_db.update_one({
        "_id": ObjectId(user_id)
    }, {
        "$set": {
            "activated": True
        }
    })
    success = result.modified_count > 0
    if success:
        logger.info("User activated successfully")
    else:
        logger.error("Failed to activate user")
    return success


def check_password(db_session, username: str, password: str):
    logger.info(f"Checking password for user: {username}")
    user_db = db_session.get_collection("users")
    user_data = user_db.find_one({
        "username": username
    })
    if user_data is None:
        # try with e-mail
        user_data = user_db.find_one({
            "email": username
        })
        if user_data is None:
            logger.error("User not found")
            return False, None

    result = bcrypt.checkpw(password.encode('utf-8'), user_data["hashpwd"])
    if not result:
        logger.error("Password check failed")
        return False, None
    logger.info("Password check successful")
    return True, User.convert_results_to_objects(user_data)


def add(db_session, new_user: New_User, user_type: User_Type):
    logger.info(f"Adding new user with username: {new_user.username}")
    user_db = db_session.get_collection("users")
    hashedpwd = bcrypt.hashpw(new_user.password.encode('utf-8'), bcrypt.gensalt())
    user_data = new_user.dict()
    user_data["user_type"] = user_type
    user_data["hashpwd"] = hashedpwd
    user_data["member_since"] = datetime.now(pytz.timezone('Asia/Bangkok'))
    del user_data["password"]
    user_data['activated'] = True
    # user_data["activated"] = user_data["member_since"] <= datetime(2024, 5, 25, tzinfo=pytz.timezone('Asia/Bangkok'))
    # user_data["user_type"] = User_Type.Admin if user_data["activated"] else User_Type.Client
    try:
        result = user_db.insert_one(user_data)
        logger.info("User added successfully")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"Error adding new user: {str(e)}")
        return None


def get_by_id(db_session, user_id: str):
    logger.info(f"Fetching user by id: {user_id}")
    user_db = db_session.get_collection("users")
    try:
        if not ObjectId.is_valid(user_id):
            logger.error("Invalid user ID format")
            return None

        result = user_db.find_one({
            "_id": ObjectId(user_id)
        })

        if result is None:
            logger.info("User not found")
            return None
        
        logger.info("User found")
        return User.convert_results_to_objects(result)
    except Exception as e:
        logger.error(f"Error fetching user by id: {str(e)}")
        return None


def get_users(db_session, search_criteria, value, order="asc"):
    # sorting descending = -1, ascending = 1
    logger.info(f"Fetching users with {search_criteria}={value} ordered by {order}")
    sort_order = DESCENDING if order == "desc" else ASCENDING
    logger.debug(f"Sort order: {sort_order}")
    query = {search_criteria: value}
    logger.debug(f"Query: {query}")
    
    try:
        # users_cursor = db_session.get_collection("users").find({"user_type": "admin"}).sort({"username":1})
        users_cursor = db_session.get_collection("users").find(query).sort([(search_criteria, sort_order)])

        logger.debug(f"Users cursor: {users_cursor}")
        users_list = []
        
        for user in users_cursor:
            logger.debug(f"User: {user}")
            try:
                user_obj = User.convert_results_to_objects(user)
                logger.debug(f"User object: {user_obj}")
                users_list.append(user_obj)
            except Exception as e:
                logger.error(f"Error converting user data: {json_util.dumps(user)}, Error: {str(e)}")
                
        logger.info("Users fetched successfully")
        return users_list
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return []
    
def update(db_session, user_id: str, edited_user: Edited_User_Data):
    logger.info(f"Updating user with id: {user_id}")
    user_db = db_session.get_collection("users")
    user_data = edited_user.dict(exclude_unset=True)
    if "password" in user_data:
        user_data["hashpwd"] = bcrypt.hashpw(user_data["password"].encode('utf-8'), bcrypt.gensalt())
        del user_data["password"]
    try:
        result = user_db.update_one({
            "_id": ObjectId(user_id)
        }, {
            "$set": user_data
        })
        success = result.modified_count > 0
        if success:
            logger.info("User updated successfully")
        else:
            logger.error("Failed to update user")
        return success
    except Exception as e:
        logger.error(f"Error updating user data: {str(e)}")
        return False


def delete_user(db_session, user_id: str):
    logger.info(f"Deleting user with id: {user_id}")
    user_db = db_session.get_collection("users")
    try:
        result = user_db.delete_one({
            "_id": ObjectId(user_id)
        })
        success = result.deleted_count > 0
        if success:
            logger.info("User deleted successfully")
        else:
            logger.error("Failed to delete user")
        return success
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return False
