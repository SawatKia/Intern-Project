from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timedelta
from . import users, diaries


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


def initialize(db_session):
    users.initialize(db_session)
    diaries.initialize(db_session)