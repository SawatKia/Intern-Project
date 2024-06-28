from .mongo import Mongo
import os
from .. import tunnel

database = None

def get_session():
    # for postgres
    return database.get_session()


def initialize():
    global database

    mongo_connection = os.getenv("APP_MONGO_CONNECTION", None)
    mongo_table = os.getenv("APP_MONGO_DBNAME", None)

    override_address, override_port = tunnel.get_override("database")
    if override_address is not None and override_port is not None:
        # replace <BIND_HOST> with override_address
        # replace <BIND_PORT> with override_port
        mongo_connection = mongo_connection.replace("<BIND_HOST>", override_address)
        mongo_connection = mongo_connection.replace("<BIND_PORT>", str(override_port))

    if mongo_connection is not None:
        database = Mongo(mongo_connection, mongo_table)


def terminate():
    pass
