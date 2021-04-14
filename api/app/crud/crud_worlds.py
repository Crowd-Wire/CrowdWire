from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models import World, Tag
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase
from app.crud.crud_tags import tag as crud_tag

class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    def get(self, db: Session, world_id: Any) -> Optional:
        return db.query(World).filter(World.world_id == world_id).first()

    def create(self, db: Session, *, obj_in: WorldCreate) -> Any:
        """
         Create a World
        """
        creation_date = datetime.now()
        db_world = World(
            creator=obj_in.creator,
            name=obj_in.name,
            description=obj_in.description,
            allow_guests=obj_in.allow_guests,
            world_map=obj_in.world_map,
            max_users=obj_in.max_users,
            public=obj_in.public,
            creation_date=creation_date,
            update_date=creation_date,
            status=0
        )
        db.add(db_world)
        for tag_name in obj_in.tags:

            tag = crud_tag.get_by_name(db=db, name=tag_name)
            if not tag:
                # in terms of business logic we do not allow users to add the Tags They want
                return None
            db_world.tags.append(tag)

        db.commit()
        db.refresh(db_world)
        return db_world


world = CRUDWorld(World)
