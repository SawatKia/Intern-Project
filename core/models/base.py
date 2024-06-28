from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timedelta
from enum import Enum


class Mongo_Object(BaseModel):
    id: str

    @classmethod
    def convert_results_to_objects(cls, results, id_key="_id"):
        if results is None:
            return None
        
        single = True
        # if results is a cursor object
        if hasattr(results, "next"):
            single = False
        
        # if a list
        if isinstance(results, list):
            single = False

        if single:
            results["id"] = str(results[id_key])
            del results[id_key]
            return cls(**results)
        else:
            objects = []
            for r in results:
                r["id"] = str(r[id_key])
                del r[id_key]
                objects.append(cls(**r))
            return objects


class Session(BaseModel):
    user_id: str
    created_stamp: datetime
    updated_stamp: datetime
    closed: Optional[bool] = False

