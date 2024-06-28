# core/models/diaries.py
import logging
import os
import pytz

from pymongo import DESCENDING, ASCENDING
from datetime import datetime
from bson.objectid import ObjectId
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from . import base, users
from enum import Enum

# Set up the logging configuration based on environment
APP_ENV = os.getenv("APP_ENV", "prod")
LOG_LEVEL = logging.DEBUG if APP_ENV in ["dev", "debug-diariesModel"] else logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format='[%(asctime)s] [%(filename)s:%(lineno)s - %(funcName)20s() ] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# class EditorJsBlockType(str, Enum):
#     header = "header"
#     paragraph = "paragraph"
#     list = "list"
#     checklist = "checklist"
#     linkTool = "linkTool"
#     delimiter = "delimiter"

class EditorJsBlock(BaseModel):
    id: str
    type: str
    data: dict
    
class EditorJs(BaseModel):
    time: int
    blocks: List[EditorJsBlock]
    version: str

class New_Diary(BaseModel):
    content: EditorJs
    published: bool = False
    team: str

# class Comment(BaseModel):
#     commentTime: datetime
#     user: users.User
#     message: str

class Edited_Diary(BaseModel):
    content: Optional[EditorJs] = None
    published: Optional[bool] = False
    # comments: Optional[List[Comment]] = None
   
class Creator(BaseModel):
    id: str
    username: str

# what to be add in the model
class Diary(base.Mongo_Object, New_Diary):
    creator: Creator
    created_stamp: datetime
    
    class Config:
        json_encoders = {
            ObjectId: str,
        }

def initialize(db_session):
    try:
        diary_db = db_session.get_collection("diaries")
        # Drop the existing unique index on the creator field if it exists
        existing_indexes = diary_db.index_information()
        if 'creator' in existing_indexes:
            diary_db.drop_index('creator')
        diary_db.create_index([("creator", ASCENDING)])
    except Exception as e:
        pass

def add(db_session, new_diary: New_Diary, user: users.User):
    """Adds a new diary to the database. Returns the new diary's ID, or an error if one occurred."""
    assert db_session is not None, "db_session cannot be None"
    assert new_diary is not None, "new_diary cannot be None"
    assert user is not None, "user cannot be None"

    diary_db = db_session.get_collection("diaries")
    diary = new_diary.dict()
    diary["created_stamp"] = datetime.now(pytz.utc)
    diary["creator"] = {"id": str(user.id), "username": user.username}
    try:
        result = diary_db.insert_one(diary)
    except Exception as e:
        return f"Error adding diary to database: {e}"
    
    if result.inserted_id is None:
        return "Error adding diary to database: no ID returned"
    
    return str(result.inserted_id)

def get_diary_by_id(db_session, diary_id, user: users.User):
    allowed = verify_right_to_modify(db_session, diary_id, user)
    if not allowed:
        raise RuntimeError("Failed to verify right to modify diary")
    
    diary_db = db_session.get_collection("diaries")
    result = diary_db.find_one({
        "_id": ObjectId(diary_id),
        "creator.id": str(user.id)
    })
    if result is None:
        return None
    else:
        result = Diary.convert_results_to_objects(result)
        # result["id"] = str(result["_id"])
        # result["created_stamp"] = str(result["created_stamp"])
        
    return result

# get public diaries of all users
def get_public_diaries(db_session, team):
    diary_db = db_session.get_collection("diaries")
    query = {"published": True}
    if team != "all":
        query['team'] = team
    logger.debug("Query: %s", query)
    diaries_cursor = diary_db.find(query)
    logger.debug("Diaries cursor: %s", diaries_cursor)
    diaries_list = []
    for diary in diaries_cursor:
        diary_obj = Diary.convert_results_to_objects(diary)
        logger.debug("Diary object: %s", diary_obj)
        diaries_list.append(diary_obj)
    diaries_list = sort_diaries(diaries_list, sort_by="created_stamp", sort_type="desc")
    return diaries_list, len(diaries_list)

# get published diaries of current user
def get_published_diaries(db_session, user: users.User):
    diary_db = db_session.get_collection("diaries")
    query = {"published": True, "creator.id": str(user.id)}
    logger.debug("Query: %s", query)
    diaries_cursor = diary_db.find(query)
    logger.debug("Diaries cursor: %s", diaries_cursor)
    diaries_list = []
    for diary in diaries_cursor:
        diary_obj = Diary.convert_results_to_objects(diary)
        logger.debug("Diary object: %s", diary_obj)
        diaries_list.append(diary_obj)
    diaries_list = sort_diaries(diaries_list, sort_by="created_stamp", sort_type="desc")
    return diaries_list, len(diaries_list)

# get private diaries of current user
def get_private_diaries(db_session, user: users.User):
    if db_session is None or user is None:
        raise ValueError("db_session and user cannot be None")

    diary_db = db_session.get_collection("diaries")
    if diary_db is None:
        raise RuntimeError("Diary database not available")
    query = {"published": False, "creator.id": str(user.id)}
    diaries_cursor = diary_db.find(query)
    diaries_list = []
    for diary in diaries_cursor:
        diary_obj = Diary.convert_results_to_objects(diary)
        logger.debug("Diary object: %s", diary_obj)
        diaries_list.append(diary_obj)
    diaries_list = sort_diaries(diaries_list, sort_by="created_stamp", sort_type="desc")
    return diaries_list, len(diaries_list)

# update the selected diary
def update(db_session, diary_id, user: users.User, edited_diary: Edited_Diary):
    """Updates the diary with the given ID in the database.
    Returns whether the update was successful.
    """
    if diary_id is None:
        raise ValueError("diary_id cannot be None")
    if edited_diary is None:
        raise ValueError("edited_diary cannot be None or empty")
    diary_db = db_session.get_collection("diaries")
    if diary_db is None:
        raise RuntimeError("Diary database not available")
    
    allowed = verify_right_to_modify(db_session, diary_id, user)
    if not allowed:
        raise RuntimeError("Failed to verify right to modify diary")
    
    diary_data = edited_diary.dict(exclude_unset=True)
    if diary_data is None:
        raise RuntimeError("Failed to convert diary data to dict")

    diary = diary_db.find_one({
        "_id": ObjectId(diary_id),
        "creator.id": str(user.id)
    })
    if diary is None:
        return False

    for field in diary:
        if field not in diary_data:
            diary_data[field] = diary[field]

    try:
        result = diary_db.update_one({
            "_id": ObjectId(diary_id),
            "creator.id": str(user.id)
        }, {
            "$set": diary_data
        })
    except Exception as e:
        raise RuntimeError("Failed to update diary in database") from e

    return result.modified_count > 0

# delete the selected diary
def delete(db_session, diary_id, user: users.User):
    if diary_id is None:
        return ValueError("diary_id cannot be None")
    diary_db = db_session.get_collection("diaries")
    if diary_db is None:
        raise RuntimeError("Diary database not available")
    allowed = verify_right_to_modify(db_session, diary_id, user)
    if not allowed:
        raise RuntimeError("Failed to verify right to modify diary")

    try:
        result = diary_db.delete_one({
            "_id": ObjectId(diary_id),
            "creator.id": str(user.id)
        })
    except Exception as e:
        raise RuntimeError("Failed to delete diary") from e

    return result.deleted_count > 0

def verify_right_to_modify(db_session, diary_id, user: users.User):
    logger.debug("Verifying right to modify diary: %s", diary_id)
    if diary_id is None:
        return False

    diary_db = db_session.get_collection("diaries")
    if diary_db is None:
        raise RuntimeError("Diary database not available")

    try:
        logger.debug("Finding diary: %s", diary_id)
        diary = diary_db.find_one({
            "_id": ObjectId(diary_id)
        })
    except Exception as e:
        raise RuntimeError("Failed to find diary") from e

    if diary is None:
        logger.debug("Diary not found: %s", diary_id)
        return False

    if str(diary.get("creator", {}).get("id")) == str(user.id):
        logger.debug("this user is the creator of the diary: %s, modifying are allowed", diary_id)
        return True
    else:
        logger.debug("this user is not the creator of the diary: %s, modifying are not allowed!!!!!", diary_id)
        return False
    
# General function to sort diaries by a specified attribute and sort type
def sort_diaries(diaries_list, sort_by, sort_type="desc"):
    reverse = True if sort_type == "desc" else False
    return sorted(diaries_list, key=lambda x: getattr(x, sort_by), reverse=reverse)