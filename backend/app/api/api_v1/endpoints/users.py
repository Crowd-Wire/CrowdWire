from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas,crud
from app.api import dependencies as deps
from typing import Any
from fastapi import HTTPException

router = APIRouter()

@router.get("/", tags=["users"])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.post("/")
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(deps.get_db)
) -> Any:
    db_user = crud.user.get_by_email(db=db, email=user.email)

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return crud.user.create(db=db, new_user=user)
