from datetime import datetime

from sqlalchemy.orm import Session
from loguru import logger
from .crud_roles import crud_role
from .base import CRUDBase
from app.redis.connection import redis_connector
from app.models import World_User, World, User, Role
from app.schemas import World_UserCreate, World_UserUpdate
from app.utils import choose_avatar
from app.core import strings


class CRUDWorld_User(CRUDBase[World_User, World_UserCreate, World_UserUpdate]):

    def can_generate_link(self, db: Session, world_id: int, user_id: int):
        # Check first if user is in world
        world_user_obj = db.query(World_User).join(Role).filter(
            World_User.user_id == user_id,
            World_User.world_id == world_id
        )
        if not world_user_obj.first():
            return None, strings.USER_NOT_IN_WORLD
        # Check if has permission to generate invitation links
        world_user_obj = world_user_obj.filter(Role.invite.is_(True)).first()
        if not world_user_obj:
            return None, strings.INVITATION_FORBIDDEN
        logger.debug(world_user_obj)
        return world_user_obj

    def get_user_joined(self, db: Session, world_id: int, user_id: int) -> World_User:
        """
        Verify if user has already joined this world
        """
        return db.query(World_User).filter(World_User.user_id == user_id, World_User.world_id == world_id).first()

    async def join_world(self, db: Session, _world: World, _user: User) -> World_User:
        """
        Create an entry in the World_User table and in Redis if user doesn't exist already.
        Else, Update the attributes n_joins and last_join
        """
        world_user = self.get_user_joined(db=db, world_id=_world.world_id, user_id=_user.user_id)
        current_time = datetime.now()
        assigned_avatar = choose_avatar()
        if not world_user:
            default_role = crud_role.get_world_default(db=db, world_id=_world.world_id)
            world_user = World_User(
                role_id=default_role.role_id,
                join_date=current_time,
                last_join=current_time,
                n_joins=1,
                status=0,
                avatar=assigned_avatar,
                username=_user.name
            )
            db.add(world_user)
            world_user.world = _world
            _user.worlds.append(world_user)
            await redis_connector.save_world_user_data(
                world_id=_world.world_id,
                user_id=_user.user_id,
                data={'username': _user.name, 'avatar': assigned_avatar}
            )
        else:
            world_user.n_joins = world_user.n_joins + 1
            world_user.last_join = current_time

        db.commit()
        db.refresh(world_user)
        return world_user


crud_world_user = CRUDWorld_User(World_User)
