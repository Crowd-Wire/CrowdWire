from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import dependencies
from app.core import security, strings

# from app.core.security import get_password_hash
# from app.utils import (
# generate_password_reset_token,
# send_reset_password_email,
# verify_password_reset_token,
# )

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
        "expire_date": str(expires)
    }


@router.post("/login/test-token", response_model=schemas.UserInLogin)
def test_token(
        current_user: models.User = Depends(dependencies.get_current_user),
) -> Any:
    """
    Test access token
    """
    return current_user


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
