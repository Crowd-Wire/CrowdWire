from datetime import datetime
from typing import Optional, Tuple, List

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core import strings
from app.models import World
from app.redis.redis_decorator import cache
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase
from app.crud.crud_tags import tag as crud_tag
from app.crud.crud_roles import crud_role
from loguru import logger
from app.crud.crud_world_users import crud_world_user
from app.core import consts


class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    @cache
    async def get(self, db: Session, world_id: int) -> Tuple[Optional[World], str]:
        world_obj = db.query(World).filter(World.world_id == world_id).first()
        if not world_obj:
            return None, strings.WORLD_NOT_FOUND
        return world_obj, ""

    @cache
    async def get_available(self, db: Session, world_id: int, user_id: Optional[int]) -> Tuple[Optional[World], str]:
        """
        Verify the availability of a world, given a user.
        Raises Exception if the world does not exist, is Banned
        or the Users doesn't have access.
        @return: a valid World_User(or None if not valid) object and a message
        """
        world_obj, _ = await self.get(db=db, world_id=world_id)

        world_user = None
        if user_id:
            world_user = crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user_id)

        if not world_obj or world_obj.status == consts.WORLD_BANNED_STATUS \
                or (not world_obj.public and not world_user) \
                or (world_user and world_user.status == consts.WORLD_BANNED_STATUS):
            # checks if world exists, is not banned. If the world is private user has to have entered it before.
            # In case he has entered it before, check if he was banned in that world

            return None, strings.WORLD_NOT_FOUND
        return world_obj, ""

    def create(self, db: Session, obj_in: WorldCreate, *args, **kwargs) -> Tuple[Optional[World], str]:
        """
         Create a World
        """
        creation_date = datetime.now()

        user = kwargs.get('user')
        if not user:
            return None, strings.USER_NOT_PASSED

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
                return None, strings.INVALID_TAG
            db_world.tags.append(tag)

        db.commit()

        # Create Default Roles for a World
        default_roles = crud_role.create_default(db=db, world_id=db_world.world_id)
        logger.debug(default_roles)
        # TODO: check this
        # _ = crud_world_user.join_world(db=db, _world=db_world, _user=user)

        return db_world, strings.WORLD_CREATED_SUCCESS

    def filter(self, db: Session, search: str, tags: Optional[List[str]]) -> List[World]:

        query = db.query(World).filter(
            or_(World.name.like("%"+search+"%"), World.description.like("%"+search+"%"))
        ).all()

        if tags:
            ret = []
            for obj in query:
                for tag in tags:
                    if tag in obj.tags:
                        ret.append(obj)
                        break

            return ret
        return query






crud_world = CRUDWorld(World)
