from typing import Generator, Callable, Optional, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from loguru import logger
from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/login")
reusable_oauth2_optional = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user_authorizer(*, required: bool = True) -> Callable:
    """
    @param required: a boolean flag to check whether a Authorization Dependency is needed or not
    @return: Callable function dependency based on the @param required
    """
    return get_current_user if required else get_current_user_optional


def get_current_user_optional(
        db: Session = Depends(get_db), token: str = Depends(reusable_oauth2_optional)
) -> any:
    if token:
        return get_current_user(db, token)
    return None


def get_current_user(
        db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Union[models.User, schemas.GuestUser]:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        logger.debug(payload)
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    if not token_data.is_guest_user:
        user = crud.crud_user.get(db, id=token_data.sub)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    return schemas.GuestUser(is_guest_user=True, user_id=token_data.sub)


# TODO: Verify is not a Guest User instance that is injected as a Dependency
#       in the following functions
def get_current_active_user(
        current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.crud_user.user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_superuser(
        current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.crud_user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
