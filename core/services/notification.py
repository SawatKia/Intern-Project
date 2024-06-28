import aiohttp
import enum


class Notification_Topic(str, enum.Enum):
    Activation = "activation"
    Reset_Credential = "reset_credential"
    Payment_Received = "payment_received"


async def send_notification(topic: Notification_Topic, payload):
    async with aiohttp.ClientSession() as session:
        async with session.post(f"http://email-service:8010/notification/{topic}", json=payload, headers={
            "Content-Type": "application/json"  
        }) as resp:
            if resp.status != 200:
                raise Exception(f"Failed to send notification: {resp.status} {await resp.text()}") 