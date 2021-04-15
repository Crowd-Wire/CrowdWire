from fastapi import HTTPException
from typing import Optional, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.api import dependencies as deps
from loguru import logger

router = APIRouter()


@router.get("/{world_id}", response_model=schemas.WorldMapInDB)
def get_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False)),
) -> Any:
    if user:
        logger.debug(f"Registered User {user.name} joining in")
        db_world = crud.crud_world.get(db, world_id)
        return db_world
    else:
        raise HTTPException(
            status_code=400,
            detail="Guest User cant join yet. Not Implemented.",
        )


@router.get("/join/{world_id}")
def join_world(
        world_id: int,
        db: Session = Depends(deps.get_db),
        user: Optional[models.User] = Depends(deps.get_current_user_authorizer(required=False)),
) -> Any:

    
    # registered user
    if user:
        # checks if the world is available for him
        world = crud.crud_world.get_available(db, world_id=world_id, user_id=user.user_id)

        world_user = crud.crud_world_user.join_world(db, _world=world, _user=user)

        if not world_user.avatar or not world_user.username:
            # Return something that says he does not have any of these
            logger.debug("User does not have avatar")
            return world_user

        logger.debug("User has avatar")
        # make a schema with this data
        # return world_user
        return world_user

    else:
        logger.debug("User is not registered")
        return {"lixo": "lixo"}


@router.post("/", response_model=schemas.WorldMapInDB)
def create_world(
        *,
        world_in: schemas.WorldCreate,
        db: Session = Depends(deps.get_db),
        user: models.User = Depends(deps.get_current_user_authorizer(required=True))
) -> Any:
    try:
        world_in.creator = user
        obj = crud.crud_world.create(db=db, obj_in=world_in, user=user)
        return obj
    except Exception as e:
        logger.exception(str(e))
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
