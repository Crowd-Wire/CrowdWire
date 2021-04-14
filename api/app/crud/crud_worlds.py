from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models import World
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase


class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    def get(self, db: Session, world_id: Any) -> Optional:
        return db.query(World).filter(World.world_id == world_id).first()

    """
    def create(self, db: Session, *, obj_in: WorldCreate) -> World:
        "
         Create a World
        ""
        db_world = jsonable_encoder(obj_in)
        db_world = self.model(**db_world)  # type: ignore
        db.add(db_world)
        db.commit()
        db.refresh(db_world)
        return db_world
    
    """


world = CRUDWorld(World)
