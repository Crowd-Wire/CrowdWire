from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings
from uuid import uuid4

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def check_expire_delta(expires_delta: timedelta = None) -> Any:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    return expire


def create_access_token(
        subject: Union[str, Any],
        expires_delta: timedelta = None,
        is_guest_user: bool = False
) -> Union[str, any]:
    """
    Creates jwt token with expiration date declared in settings
    """
    expire = check_expire_delta(expires_delta)

    to_encode = {"exp": expire, "sub": str(subject), "is_guest_user": is_guest_user}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire


def create_invite_token(
        subject: Union[str, Any],
        *,
        expires_delta: timedelta = None,
        world_id: int,
) -> Union[str, any]:
    """
    Creates jwt token for invitations with expiration date and the world_id,
    declared in settings
    """
    expire = check_expire_delta(expires_delta)
    to_encode = {"exp": expire, "inviter": str(subject), "world_id": world_id}
    encoded_jwt = jwt.encode(to_encode, settings.INVITE_SECRET_TOKEN, algorithm=ALGORITHM)
    return encoded_jwt, expire


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if password matches it's hash
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Returns the hash of a password
    """
    return pwd_context.hash(password)


def create_guest_uuid() -> uuid4:
    """
    Generates a uuid for Guest Users
    @return: a uuid object
    """
    return uuid4()
