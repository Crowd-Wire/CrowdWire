from datetime import timedelta
from typing import Any, Union

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.config import Config
from starlette.requests import Request
from app import crud, models, schemas
from app.api import dependencies
from app.core import security, strings

# from app.core.security import get_password_hash
# from app.utils import (
# generate_password_reset_token,
# send_reset_password_email,
# verify_password_reset_token,
# )
from app.core.config import settings
from app.utils import is_guest_user

router = APIRouter()


@router.post("/register", response_model=schemas.Token)
def register(
        user_data: schemas.UserCreate,
        db: Session = Depends(dependencies.get_db)
) -> Any:
    """
    Register a user, returns an access token for that user
    """

    user, message = crud.crud_user.create(db=db, user_data=user_data)

    if not user:
        raise HTTPException(status_code=400, detail=message)

    access_token, expires = security.create_access_token(user.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires)
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
    print(current_user)
    if is_guest_user(current_user):
        access_token, expires = security.create_access_token(
            subject=current_user.uuid,
            is_guest_user=True,
            expires_delta=timedelta(hours=settings.ACCESS_GUEST_TOKEN_EXPIRE_HOURS)
        )
        return {
            "access_token": access_token,
            "token_type": 'bearer',
            "expire_date": str(expires),
            "guest_uuid": current_user.uuid
        }
    
    access_token, expires = security.create_access_token(current_user.user_id)
    print(access_token)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires),
    }





# Google Login

# TODO: change this to get the secrets from the environment variables
config = Config('.env')
oauth = OAuth(config)

CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'

oauth.register(
    name='google',
    client_id=settings.CLIENT_ID,
    client_secret=settings.CLIENT_SECRET,
    server_metadata_url=CONF_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)


@router.route('/login/google')
async def google_login(request: Request):
    """
    The request will be redirected to google and the result will be sent to /auth/google endpoint
    """
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get('/auth/google')
async def auth(request: Request, db: Session = Depends(dependencies.get_db)):
    """
    Receives the information from the google operation and returns the application token.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError:
        return {"error": "Invalid Authentication"}

    user = await oauth.google.parse_id_token(request, token)

    user_db, msg = crud.crud_user.google_auth(db=db, user=user)

    if not user_db:
        raise HTTPException(status_code=400, detail=msg)

    access_token, expires = security.create_access_token(user_db.user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expire_date": str(expires)
    }

    return "token"

"""
@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(dependencies.get_db)) -> Any:
    """
# Password Recovery
"""
    user = crud.user.get_by_email(db, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    #send_reset_password_email(
    #    email_to=user.email, email=email, token=password_reset_token
    #)
    return {"msg": "Password recovery email sent"}

"""
"""
@router.post("/reset-password/", response_model=schemas.Msg)
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(dependencies.get_db),
) -> Any:
    """
# Reset password
"""
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    return {"msg": "Password updated successfully"}
"""
