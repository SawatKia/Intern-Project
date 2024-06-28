from typing import List, Any
import json
import signal
import logging
from datetime import datetime

import os
import sys
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, "..", ".."))
sys.path.append(os.path.join(dir_path, ".."))
from core.services import message_brokers


if __name__ == '__main__':
    logging.info("App is starting up.")
    message_brokers.initialize()

    notification_topic = "test_topic"
    
    with message_brokers.get_admin_session() as admin_session:
        message_brokers.create_topic(admin_session, notification_topic)

    consumer = message_brokers.Consumer(notification_topic)
    def signal_handler(sig, frame):
        consumer.stop_consume()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    for _, key, value in consumer([notification_topic]):
        logging.info("processing request")

        logging.info(key)
        logging.info(value)


    logging.info("App is exiting.", "Wait a moment until completely exits.")
    message_brokers.terminate()
