from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.api import dependencies as deps

router = APIRouter()


@router.get("/", response_model=List[schemas.TagInDB])
def get_all(
        db: Session = Depends(deps.get_db),
        user: models.User = Depends(deps.get_current_user_authorizer(required=True))
) -> Any:

    return crud.crud_tag.get_all(db=db)
