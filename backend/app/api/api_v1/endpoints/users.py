from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas
from app.crud import crud_users
from app.api import dependencies as deps
from typing import Any
from fastapi import HTTPException
from loguru import  logger
router = APIRouter()

@router.get("/", tags=["users"])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.post("/")
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(deps.get_db)
) -> Any:
    user = crud_users.get_by_email(db, email=user.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return crud_users.create_user(db=db, user=user)
