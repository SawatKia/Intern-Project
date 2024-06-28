import os
import json
import socket
from contextlib import contextmanager
from datetime import datetime, timedelta
from kafka3 import KafkaConsumer, KafkaProducer, KafkaAdminClient
from kafka3.admin import NewTopic
from kafka3.errors import TopicAlreadyExistsError
import time
import logging
from .. import tunnel

producer = None
kafka_servers = None

def initialize():
    global producer, kafka_servers

    kafka_servers = os.getenv("APP_KAFKA_CONNECTION", None)

    override_address, override_port = tunnel.get_override("message_brokers")
    if override_address is not None and override_port is not None:
        # replace <BIND_HOST> with override_address
        # replace <BIND_PORT> with override_port
        kafka_servers = kafka_servers.replace("<BIND_HOST>", override_address)
        kafka_servers = kafka_servers.replace("<BIND_PORT>", str(override_port))
        
    delay_start = int(os.getenv("KAFKA_CONNECTION_DELAY", 0))
    if delay_start > 0:
        time.sleep(delay_start)


    producer = KafkaProducer(
        bootstrap_servers=kafka_servers,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda v: v.encode('utf-8')
    )

    
    # check connectivity
    try:
        metrics = producer.metrics()
        print("Kafka connected.", metrics)
    except Exception as e:
        print("Kafka not available. Exiting.")
        print(e)
        exit(1)


def terminate():
    global producer
    producer.flush()


def send_message(topic, key, value, wait_for_ack=False):
    future = producer.send(topic, key=key, value=value)
    if wait_for_ack:
        result = future.get(timeout=10)
        if result is None:
            return False

    return True

class Consumer:
    def __init__(self, group_id):
        self.stop_loop = False
        self.group_id = group_id

        self.terminating = False

        self.consumer = KafkaConsumer(
            bootstrap_servers=kafka_servers,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id=self.group_id,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            key_deserializer=lambda x: x.decode('utf-8'),
            max_poll_interval_ms=3600000
        )


    def __call__(self, topics, on_idle=None, on_idle_timeout=10000):
        self.consumer.subscribe(topics)

        while not self.stop_loop:

            msg = self.consumer.poll(max_records=1, update_offsets=True)
            # if msg is an empty dict, then it's an idle timeout
            if len(msg) > 0:
                for topic_partition, consumer_records in msg.items():
                    topic = topic_partition.topic
                    for consumer_record in consumer_records:
                        key = consumer_record.key
                        value = consumer_record.value
                        yield topic, key, value
            
        self.consumer.unsubscribe()

        if self.terminating:
            self.consumer.close()
        

    def stop_consume(self):
        self.stop_loop = True


    def terminate(self):
        self.stop_consume()
        self.terminating = True


@contextmanager
def get_admin_session():
    admin_client = KafkaAdminClient(
        bootstrap_servers=kafka_servers,
        client_id=socket.gethostname()
    )
    yield admin_client


def create_topic(admin, topic, num_partitions=1, replication_factor=1, exist_ok=True):
    new_topic = NewTopic(
        name=topic,
        num_partitions=num_partitions,
        replication_factor=replication_factor
    ) 
    try:
        result_dict = admin.create_topics([new_topic])
    except TopicAlreadyExistsError as e:
        if not exist_ok:
            raise e
        return False

