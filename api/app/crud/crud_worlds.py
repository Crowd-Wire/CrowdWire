from datetime import datetime
from typing import Optional, Tuple, Union, Dict, Any, List

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core import strings
from app.models import World, User, Tag
from app.redis import redis_connector
from app.redis.redis_decorator import cache, clear_cache_by_model
from app.schemas import WorldCreate, WorldUpdate
from app.crud.base import CRUDBase
from app.crud.crud_tags import crud_tag
from app.crud.crud_roles import crud_role
from loguru import logger
from app.crud.crud_world_users import crud_world_user
from app.core import consts


class CRUDWorld(CRUDBase[World, WorldCreate, WorldUpdate]):

    def is_editable_to_user(self, db: Session, world_id: int, user_id: int):
        world_obj = db.query(World).join(User).filter(
            World.creator == user_id,
            World.world_id == world_id,
            World.status != consts.WORLD_DELETED_STATUS
        ).first()
        if not world_obj:
            return None, strings.EDITION_FORBIDDEN
        return world_obj, ""

    def is_name_in_use(self, db: Session, world_name) -> Tuple[Optional[World], str]:
        """
        Check if the name of a World is already in use
        """
        world_obj = db.query(World).filter(World.name == world_name).first()
        if not world_obj:
            return world_obj, ""
        return world_obj, strings.WORLD_NAME_ALREADY_IN_USE

    async def update_online_users(self, world: World, offset: int):
        """
        Verifies the current number of online users in a world, if  not possible to join
        , due to max number of users, no values are updated.
        """
        n_users = await redis_connector.get_online_users(world.world_id)
        if n_users == world.max_users:
            return None, strings.MAX_USERS_IN_WORLD
        await redis_connector.update_online_users(world_id=world.world_id, offset=offset)
        return world, ""


    @cache(model="World")
    async def get(self, db: Session, world_id: int) -> Tuple[Optional[World], str]:
        world_obj = db.query(World).filter(
            World.world_id == world_id,
            World.status != consts.WORLD_DELETED_STATUS
        ).first()
        if not world_obj:
            return None, strings.WORLD_NOT_FOUND
        return world_obj, ""

    @cache(model="World")
    async def get_available_for_guests(self, db: Session, world_id: int) -> Tuple[Optional[World], str]:

        world_obj = db.query(World).filter(
            World.world_id == world_id,
            World.public.is_(True),
            World.allow_guests.is_(True),
            World.status != consts.WORLD_DELETED_STATUS
        ).first()
        if not world_obj:
            return None, strings.WORLD_NOT_FOUND
        return world_obj, ""

    @cache(model="World")
    async def get_available(self, db: Session, world_id: int, user_id: Optional[int]) -> Tuple[Optional[World], str]:
        """
        Verify the availability of a world, given a  registered user.
        Raises Exception if the world does not exist, is Banned
        or the Users doesn't have access.
        @return: a valid World_User(or None if not valid) object and a message
        """
        world_obj, _ = await self.get(db=db, world_id=world_id)

        world_user = None
        if user_id:
            world_user = crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user_id)
        if not world_obj or world_obj.status == consts.WORLD_BANNED_STATUS \
                or (world_user and world_user.status == consts.USER_BANNED_STATUS) \
                or (not world_obj.public and not world_user):
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

        # Verify if the name of the world is already in use
        obj, msg = self.is_name_in_use(db=db, world_name=obj_in.name)
        if obj:
            return None, msg

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

    async def update(self, db: Session, *,
                     db_obj: World,
                     obj_in: Union[WorldUpdate, Dict[str, Any]]
                     ) -> Tuple[Optional[World], str]:

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if 'creator' in update_data:
            del update_data['creator']

        if 'tags' in update_data:
            # TODO Check best way to do this
            lst = []
            # Obtain the Tag Objects
            for tag_name in update_data['tags']:
                if valid_tag := crud_tag.get_by_name(db=db, name=tag_name):
                    lst.append(valid_tag)
                else:
                    return None, strings.INVALID_TAG
            update_data['tags'] = lst
        # clear cache of the queries related to the object
        await clear_cache_by_model("World", world_id=db_obj.world_id)
        obj = super().update(db, db_obj=db_obj, obj_in=update_data)
        return obj, strings.WORLD_UPDATE_SUCCESS

    def filter(self,
               db: Session,
               search: str,
               tags: Optional[List[str]],
               is_guest: bool = False,
               visibility: str = "public",
               user_id: int = 0,
               page: int = 1
               ) -> List[World]:

        if not tags:
            tags = []

        query = db.query(World)

        if is_guest:
            # guests can only access public worlds
            query = query.filter(World.allow_guests.is_(True))
        else:
            if visibility == "public":
                query = query.filter(World.public)
            elif visibility == "joined":
                query = query.join(World.users).filter(User.user_id == user_id)
            elif visibility == "owned":
                query = query.filter(World.creator == user_id)

        query = query.filter(World.status == consts.WORLD_NORMAL_STATUS).filter(
            or_(World.name.ilike("%" + search + "%"), World.description.ilike("%" + search + "%"))
        )
        if tags:
            query = query.join(World.tags).filter(Tag.name.in_(tags))

        # TODO: change page size and make it not hardcoded
        return query.offset(10 * (page - 1)).limit(10).all()

    async def remove(self, db: Session, *, world_id: int, user_id: int = None) -> Tuple[Optional[World], str]:
        if not user_id:
            return None, strings.USER_NOT_PASSED
        # Check first if the world Exists
        # For Statistics Purposes we do not really delete the worlds, since
        # we would lose all the data
        obj, msg = self.is_editable_to_user(db=db, world_id=world_id, user_id=user_id)
        if not obj:
            return obj, msg
        obj.status = consts.WORLD_DELETED_STATUS
        db.add(obj)
        db.commit()
        db.refresh(obj)
        await clear_cache_by_model("World", world_id=world_id)
        return obj, strings.WORLD_DELETED_SUCCESS


crud_world = CRUDWorld(World)
