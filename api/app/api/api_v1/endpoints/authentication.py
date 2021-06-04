from datetime import timedelta
from typing import Any, Union
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import dependencies
from app.core import security, strings
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.utils import is_guest_user, send_email
# from app.core.security import get_password_hash


router = APIRouter()


@router.post("/register")
async def register(
        user_data: schemas.UserCreate,
        db: Session = Depends(dependencies.get_db)
) -> Any:
    """
    Register a user, returns an access token for that user
    """

    user, message = crud.crud_user.create(db=db, user_data=user_data)

    if not user:
        raise HTTPException(status_code=400, detail=message)

    await send_email('brunosb@ua.pt', user.user_id)

    return {'status': 'ok'}


@router.get('/confirm/{token}')
def confirm_email(
        db: Session = Depends(dependencies.get_db),
        user: models.User = Depends(dependencies.get_confirm_email_token)
):
    """
    Receives a token and confirms the user registration in the app.
    Returns the access token so that there is no need for it to login.
    """
    user, msg = crud.crud_user.confirm_email(db=db, user_id=user.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail=msg)

    access_token, expires = security.create_access_token(user.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires),
    }


@router.post("/invitation/{world_id}")
def generate_invite_link(
        world_id: int,
        db: Session = Depends(dependencies.get_db),
        current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Generate an invitation link( a token )
    """

    if is_guest_user(current_user):
        raise HTTPException(status_code=403, detail=strings.ACCESS_FORBIDDEN)
    world_user_obj, msg = crud.crud_world_user.can_generate_link(
        db=db,
        world_id=world_id,
        user_id=current_user.user_id
    )
    if not world_user_obj:
        raise HTTPException(status_code=403, detail=msg)
    access_token, expires = security.create_invite_token(
        subject=current_user.user_id,
        world_id=world_id
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires),
    }


@router.post("/login", response_model=schemas.Token)
def login_access_token(
        db: Session = Depends(dependencies.get_db),
        form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user, message = crud.crud_user.authenticate(
        db, email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(status_code=400, detail=message)
    elif not crud.crud_user.is_active(db=db, user=user):
        raise HTTPException(status_code=400, detail=strings.INACTIVE_USER)

    access_token, expires = security.create_access_token(user.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires),
        "is_superuser": user.is_superuser
    }


@router.post('/join-guest', response_model=schemas.TokenGuest)
def join_as_guest():
    """
    Generates Valid Token for Guest Users
    """
    _uuid = security.create_guest_uuid()
    access_token, expires = security.create_access_token(
        subject=_uuid,
        is_guest_user=True,
        expires_delta=timedelta(hours=settings.ACCESS_GUEST_TOKEN_EXPIRE_HOURS)
    )
    return {
        "access_token": access_token,
        "token_type": 'bearer',
        "expire_date": str(expires),
        "guest_uuid": _uuid
    }


@router.post("/login/test-token", response_model=schemas.UserInLogin)
def test_token(
        current_user: models.User = Depends(dependencies.get_current_user),
) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/reset-token")
def reset_token(
    current_user: Union[models.User, schemas.GuestUser] = Depends(dependencies.get_expired_token_user)
) -> Any:

    if is_guest_user(current_user):
        access_token, expires = security.create_access_token(
            subject=current_user.user_id,
            is_guest_user=True,
            expires_delta=timedelta(hours=settings.ACCESS_GUEST_TOKEN_EXPIRE_HOURS)
        )
        return {
            "access_token": access_token,
            "token_type": 'bearer',
            "expire_date": str(expires),
            "guest_uuid": current_user.user_id
        }

    access_token, expires = security.create_access_token(current_user.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires),
    }


@router.post('/login/google')
async def auth(token: schemas.GoogleToken, db: Session = Depends(dependencies.get_db)):
    """
    Receives the information from the google operation and returns the application token.
    """
    try:
        user = id_token.verify_oauth2_token(token.token, requests.Request(), settings.CLIENT_ID)
    except Exception:
        return {"error": "Invalid Authentication"}

    user_db, msg = crud.crud_user.google_auth(db=db, user=user)

    if not user_db:
        raise HTTPException(status_code=400, detail=msg)

    access_token, expires = security.create_access_token(user_db.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires)
    }
