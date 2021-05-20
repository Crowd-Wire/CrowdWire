from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy.orm import Session
from loguru import logger
from .crud_roles import crud_role
from .base import CRUDBase
from app.redis.connection import redis_connector
from app.models import World_User, World, User, Role
from app.schemas import World_UserCreate, World_UserUpdate
from app.utils import choose_avatar
from app.core import strings
from sqlalchemy import or_


class CRUDWorld_User(CRUDBase[World_User, World_UserCreate, World_UserUpdate]):

    def can_generate_link(self, db: Session, world_id: int, user_id: int):
        # # Check first if user is in world
        # world_user_obj = db.query(World_User).join(Role).filter(
        #     World_User.user_id == user_id,
        #     World_User.world_id == world_id
        # )
        # if not world_user_obj.first():
        #     return None, strings.USER_NOT_IN_WORLD
        # # Check if has permission to generate invitation links
        # world_user_obj = world_user_obj.filter(or_(Role.invite.is_(True),)).first()
        world_user_obj = db.query(World_User).join(Role).join(World).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            Role.world_id == world_id,
            or_(Role.role_manage.is_(True), World.creator == user_id)).first()
        if not world_user_obj:
            return None, strings.INVITATION_FORBIDDEN
        logger.debug(world_user_obj)
        return world_user_obj, ""

    def get_user_joined(self, db: Session, world_id: int, user_id: int) -> World_User:
        """
        Verify if user has already joined this world
        """
        return db.query(World_User).filter(World_User.user_id == user_id, World_User.world_id == world_id).first()

    def update_user_role(self, db: Session, world_id: int, user_id: int, role_id: int) \
            -> Tuple[Optional[World_User], str]:
        world_user = self.get_user_joined(db=db, world_id=world_id, user_id=user_id)
        if world_user:
            world_user.role_id = role_id
            db.add(world_user)
            db.commit()
            db.refresh(world_user)
            return world_user, strings.ROLE_CHANGED_SUCCESS
        return None, strings.USER_NOT_IN_WORLD

    def change_roles(self, db: Session, world_id: int, role_to_change_id: int, role_changed_id: int):
        """
        it changes the role of all users with this role
        """
        updated_objs = db.query(World_User) \
            .filter(world_id == world_id,
                    World_User.role_id == role_changed_id)\
            .update({World_User.role_id: role_to_change_id})

        db.commit()
        return updated_objs, ""

    async def update_world_user_info(
            self, db: Session, world_id: int, request_user: User, user_to_change: int, world_user_data: World_UserUpdate
    ):

        # checks if the user has already joined this world
        world_user_obj = self.get_user_joined(db=db, world_id=world_id, user_id=user_to_change)
        if not world_user_obj:
            return None, strings.USER_NOT_IN_WORLD

        # checks if the user has access to change status if status is given
        role, msg = await crud_role.can_access_world_ban(db=db, world_id=world_id, user_id=request_user.user_id)
        if world_user_data.status and role is None:
            return None, strings.USER_NO_ROLE_PERMISSIONS

        # checks if the user is either itself or has access to change user status
        if request_user.user_id != user_to_change and role is None:
            return None, strings.USER_NO_ROLE_PERMISSIONS

        # checks if it is the world the one changing its username or avatar
        if request_user.user_id != user_to_change and (world_user_obj.username or world_user_obj.avatar):
            return None, strings.CHANGE_USER_INFO_FORBIDDEN

        if world_user_data.status is None:
            delattr(world_user_data, 'status')
        if world_user_data.username is None:
            delattr(world_user_data, 'username')
        if world_user_data.avatar is None:
            delattr(world_user_data, 'avatar')

        # no need to return error
        world_user = self.update(
            db=db,
            db_obj=world_user_obj,
            obj_in=world_user_data
        )
        return world_user, ""

    async def join_world(self, db: Session, _world: World, _user: User) -> Tuple[World_User, Role]:
        """
        Create an entry in the World_User table and in Redis if user doesn't exist already.
        Else, Update the attributes n_joins and last_join
        @return: a Tuple of a WorldUser and the default Role(easier to assign to pydantic schemas)
        """
        world_user = self.get_user_joined(db=db, world_id=_world.world_id, user_id=_user.user_id)
        current_time = datetime.now()

        role = None
        if not world_user:
            role = crud_role.get_world_default(db=db, world_id=_world.world_id)
            assigned_avatar = choose_avatar()
            world_user = World_User(
                role_id=role.role_id,
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

        else:
            role, msg = await crud_role.get_user_role_in_world(db=db, user_id=_user.user_id, world_id=_world.world_id)
            if role is None:
                return None, msg
            world_user.n_joins = world_user.n_joins + 1
            world_user.last_join = current_time

        await redis_connector.save_world_user_data(
            world_id=_world.world_id,
            user_id=_user.user_id,
            data={
                'username': world_user.username,
                'avatar': world_user.avatar,
                'role': role
            }
        )
        db.commit()
        db.refresh(world_user)
        return world_user, role


crud_world_user = CRUDWorld_User(World_User)
