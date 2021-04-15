from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models import World
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase
from app.crud.crud_tags import tag as crud_tag
from app.crud.crud_roles import crud_role
from loguru import logger
from app.crud.crud_world_users import crud_world_user


class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    def get(self, db: Session, world_id: int) -> Optional:
        return db.query(World).filter(World.world_id == world_id).first()

    def get_available(self, db: Session, world_id: int, user_id: Optional[int]) -> Optional:
        """
        Verify the availability of a world, given a user.
        Raises Exception if the world does not exist, is Banned
        or the Users doesn't have access.
        @return: a valid World_User object
        """
        world_obj = self.get(db=db, world_id=world_id)

        world_user = None
        if user_id:
            world_user = crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user_id)

        if not world_obj or world_obj.status != 0 \
                or (not world_obj.public and not world_user)\
                or (world_user and world_user.status != 0):
            # checks if world exists, is not banned. If the world is private user has to have entered it before.
            # In case he has entered it before, check if he was banned in that world

            raise Exception(f"World with id {world_id} Not Found or is not currently available.")
        return world_obj

    def create(self, db: Session, obj_in: WorldCreate, *args, **kwargs) -> Any:
        """
         Create a World
        """
        creation_date = datetime.now()

        user = kwargs.get('user')
        if not user:
            raise Exception("Argument \"user\" was not passed.")

        db_world = World(
            creator=user.user_id,
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
                raise Exception("Invalid Tag. Tag does not exist.")
            db_world.tags.append(tag)

        db.commit()

        # Create Default Roles for a World
        default_roles = crud_role.create_default(db=db, world_id=db_world.world_id)
        logger.debug(default_roles)
        _ = crud_world_user.join_world(db=db, _world=db_world, _user=user)

        return db_world


crud_world = CRUDWorld(World)
