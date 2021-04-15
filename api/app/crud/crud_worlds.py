from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models import World, World_User, User
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase
from app.crud.crud_tags import tag as crud_tag
from app.crud.crud_roles import crud_role
from loguru import logger
"""
This Class does both CRUD Operations
on World as well as World_User, since World_User is a Many-to-Many 
Association Model
"""
class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    def get(self, db: Session, world_id: int) -> Optional:
        return db.query(World).filter(World.world_id == world_id).first()

    def get_user_joined(self, db: Session, world_id: int, user_id: int) -> World_User:
        """
        Verify if user has already joined this world
        """
        logger.debug(f"{world_id}:{user_id}")
        return db.query(World_User).filter(World_User.user_id == user_id, World_User.world_id == world_id).first()

    def join_world(self, db: Session, _world: World, _user: User) -> World_User:
        """
        Create an entry in the World_User table if user doesn't exist already
        Else, Update the attributes n_joins and last_join
        """
        world_user = self.get_user_joined(db, _world.world_id, _user.user_id)
        current_time = datetime.now()
        if not world_user:
            default_role = crud_role.get_world_default(db=db, world_id=_world.world_id)
            world_user = World_User(
                role_id=default_role.role_id,
                join_date=current_time,
                last_join=current_time,
                n_joins=1,
                status=0
            )

            db.add(world_user)
            world_user.world = _world
            _user.worlds.append(world_user)

        else:
            world_user.n_joins = world_user.n_joins + 1
            world_user.last_join = current_time

        db.commit()
        db.refresh(world_user)
        return world_user

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
        _ = self.join_world(db=db, _world=db_world, _user=user)

        return db_world


world = CRUDWorld(World)
