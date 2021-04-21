from fastapi import HTTPException, Query
from typing import Optional, Any, List, Union
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.api import dependencies as deps
from loguru import logger
from app.redis import redis_connector
from app.utils import is_guest_user
from app.core import strings

router = APIRouter()


@router.get("/", response_model=List[schemas.TagInDB])
def get_all(
        db: Session = Depends(deps.get_db),
        #user: models.User = Depends(deps.get_current_user_authorizer(required=True))
) -> Any:

    return crud.crud_tag.get_all(db=db)
