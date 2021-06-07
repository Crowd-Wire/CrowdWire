from typing import Generator, Callable, Union, Tuple

from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from loguru import logger
from datetime import datetime, timedelta
from app.core import consts
from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal

from app.crud import crud_user, crud_world

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


def get_confirm_email_token(
        token: str,
        db: Session = Depends(get_db),
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        logger.debug(payload)
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        logger.debug(e)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid Token",
        )

    user = crud.crud_user.is_pending(db=db, user_id=int(token_data.sub))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist or is already confirmed")
    return user


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
        logger.debug(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    if not token_data.is_guest_user:
        user = crud.crud_user.get(db, id=token_data.sub)
        if not user or user.status != consts.USER_NORMAL_STATUS:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    return schemas.GuestUser(is_guest_user=True, user_id=token_data.sub)


async def get_current_user_for_invite(
        invite_token: str,
        *,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
) -> Tuple[Union[schemas.GuestUser, models.User], models.World]:
    try:
        logger.debug(invite_token)
        payload = jwt.decode(
            invite_token, settings.INVITE_SECRET_TOKEN, algorithms=[security.ALGORITHM]
        )
        logger.debug(payload)
        token_data = schemas.InviteTokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        logger.debug(e)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Invite",
        )
    world, msg = await crud.crud_world.get(db=db, world_id=token_data.world_id)
    if not world:
        raise HTTPException(status_code=404, detail=msg)
    return current_user, world


async def get_websockets_user(
        websocket: WebSocket,
        *,
        token: str,
        world_id: int,
        db: Session = Depends(get_db)
) -> str:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        logger.debug(payload)
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        logger.debug(e)
        raise await websocket.close(code=status.WS_1008_POLICY_VIOLATION)

    # checks if the user has access to that world
    # he might try to connect to the websockets directly
    if token_data.is_guest_user:
        world_obj, msg = await crud_world.get_available_for_guests(db=db, world_id=world_id, user_id=token_data.sub)
    else:
        world_obj, msg = await crud_world.get_available(db=db, world_id=world_id, user_id=token_data.sub)

    logger.debug(token_data.sub)
    logger.debug(world_obj)
    if not world_obj:
        raise await websocket.close(code=status.WS_1008_POLICY_VIOLATION)

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


def get_expired_token_user(token: str = Depends(reusable_oauth2_optional), db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM], options={'verify_exp': False}
        )
        logger.debug(payload)
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        logger.debug(e)
        if str(e) != "Signature has expired.":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    # after hour of inactivity the users session expire and they have to login again
    if token_data.exp + timedelta(hours=1) >= datetime.now(token_data.exp.tzinfo):
        if not token_data.is_guest_user:
            return crud_user.get(db, id=token_data.sub)
        return schemas.GuestUser(is_guest_user=True, user_id=token_data.sub)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session Expired",
    )
