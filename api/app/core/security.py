from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings
from uuid import uuid1, UUID

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def create_access_token(
        subject: Union[str, Any],
        expires_delta: timedelta = None,
        is_guest_user: bool = False
) -> Union[str, any]:
    """
    Creates jwt token with expiration date declared in settings
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject), "is_guest_user": is_guest_user}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
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


def create_guest_uuid() -> UUID:
    """
    Generates a uuid for Guest Users
    @return: a uuid object
    """
    return uuid1()
