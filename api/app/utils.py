from uuid import uuid4
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt

from app import schemas, models
from app.core.config import settings
from app.core.consts import AVATARS_LIST
from random import choice
from loguru import logger
from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List, Dict



def choose_avatar():
    """
    Chooses a random avatar from the available Ones
    @return: a avatar filename
    """
    return choice(AVATARS_LIST)


def is_guest_user(obj: Union[schemas.GuestUser, models.User]) -> bool:
    return isinstance(obj, schemas.GuestUser)


def generate_guest_username(user_id: uuid4) -> str:
    logger.info(user_id.fields)
    sub_uuid = str(user_id.fields[-1])[:8]
    return f'Guest_{sub_uuid}'


def row2dict(model) -> dict:
    return {c.name: str(getattr(model, c.name)) for c in model.__table__.columns}


class EmailSchema(BaseModel):
    email: List[EmailStr]
    body: Dict[str, Any]


conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_USER,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,
    MAIL_FROM=settings.EMAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
)


async def send_email(
    email_to: str,
) -> None:
    html = f"<h3>Hello {email_to}</h3>"

    message = MessageSchema(
        subject="Crowdwire",
        recipients=[email_to],
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
