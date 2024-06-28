from typing import List, Any
from fastapi import FastAPI, Depends, HTTPException, Header, Query, Body
import os
from contextlib import asynccontextmanager


import sys
dir_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(dir_path, ".."))

from core.services import notification

from mailersend import emails
mailer = emails.NewEmail(os.getenv('MAILERSEND_API_TOKEN'))
mailer_name = emails.NewEmail(os.getenv('MAILERSEND_SENDER_NAME'))
mailer_email = emails.NewEmail(os.getenv('MAILERSEND_SENDER_EMAIL'))


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    lifespan=lifespan
)

def send_mail(recipient_email: str, recipient_name: str, subject: str, body: str):
    mail_body = {}
    mail_from = {
        "name": mailer_name,
        "email": mailer_email
    }

    recipients = [
        {
            "name": recipient_name,
            "email": recipient_email
        }
    ]

    mailer.set_mail_from(mail_from, mail_body)
    mailer.set_mail_to(recipients, mail_body)
    mailer.set_subject(subject, mail_body)
    mailer.set_html_content(body, mail_body)

    result = mailer.send(mail_body)
    status_code = int(result.split("\n")[0])
    if status_code >= 400:
        raise Exception("Mailersend API error:" + result)



@app.post("/notification/{topic}")
async def notify(topic: str, payload: Any = Body(...)):
    
    try:
        send_mail(payload.get("email"), payload.get("username"), payload["subject"], payload["body"])
    except Exception as e:
        return {"status": "failed", "reason": str(e)}
    return {"status": "success"}



if __name__ == '__main__':
    import uvicorn
    workers = int(os.getenv("EMAIL_ENGINE_WORKERS", 1))
    uvicorn.run("entrypoint:app", host="0.0.0.0", port=8010, log_level="info", workers=workers)