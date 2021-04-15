from datetime import datetime
from typing import Dict, Any, Union

from sqlalchemy.orm import Session

from .crud_roles import crud_role
from .base import CRUDBase
from app.models import World_User, World, User
from app.schemas import World_UserCreate, World_UserUpdate


class CRUDWorld_User(CRUDBase[World_User, World_UserCreate, World_UserUpdate]):

    def get_user_joined(self, db: Session, world_id: int, user_id: int) -> World_User:
        """
        Verify if user has already joined this world
        """
        return db.query(World_User).filter(World_User.user_id == user_id, World_User.world_id == world_id).first()

    def join_world(self, db: Session, _world: World, _user: User) -> World_User:
        """
        Create an entry in the World_User table if user doesn't exist already
        Else, Update the attributes n_joins and last_join
        """
        world_user = self.get_user_joined(db=db, world_id=_world.world_id, user_id=_user.user_id)
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



crud_world_user = CRUDWorld_User(World_User)
