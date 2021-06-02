from datetime import datetime
from typing import Optional, Tuple, Union, Dict, Any, List

from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.core import strings
from app.models import World, User, Tag
from app.redis.redis_decorator import cache, clear_cache_by_model
from app.schemas import WorldCreate, WorldUpdate, WorldInDBWithUserPermissions
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

    @cache(model="World")
    async def get(self, db: Session, world_id: int) -> Tuple[Optional[World], str]:
        world_obj = db.query(World).filter(
            World.world_id == world_id,
            World.status != consts.WORLD_DELETED_STATUS
        ).first()
        if not world_obj:
            return None, strings.WORLD_NOT_FOUND
        return world_obj, ""

    async def get_world_with_user_permissions(self, db: Session, world_id: int, user_id: int) \
            -> Tuple[Optional[WorldInDBWithUserPermissions], str]:
        """
        Returns the world details and the permissions that the request user has in that world.
        """

        world, msg = await self.get(db=db, world_id=world_id)
        if not world:
            return None, msg
        role, msg = await crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=user_id)
        world.__setattr__('is_creator', world.creator == user_id)
        world.__setattr__('can_manage', role is not None)
        world.__setattr__('update_date', world.update_date)
        return WorldInDBWithUserPermissions(**world.__dict__), ""

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

    async def create(self, db: Session, obj_in: WorldCreate, *args, **kwargs) -> Tuple[Optional[World], str]:
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
            profile_image=obj_in.profile_image,
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
        default_role = crud_role.create_default(db=db, world_id=db_world.world_id)

        world_user, msg = await crud_world_user.join_world(db=db, _world=db_world, _user=user)
        if world_user is None:
            return None, msg
        logger.debug(default_role)

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
        obj = super().update(db=db, db_obj=db_obj, obj_in=update_data)
        db.add(obj)
        db.commit()
        logger.debug(obj)
        return obj, strings.WORLD_UPDATE_SUCCESS

    def filter(self,
               db: Session,
               search: str,
               tags: Optional[List[str]],
               is_guest: bool = False,
               is_superuser: bool = False,
               visibility: str = "public",
               normal: bool = False,
               banned: bool = False,
               deleted: bool = False,
               creator: int = None,
               order_by: str = "timestamp",
               order: str = "desc",
               page: int = 1,
               limit: int = 10,
               requester_id: int = None,
               ):

        if page < 1:
            return None, strings.INVALID_PAGE_NUMBER
        if not tags:
            tags = []
        query = db.query(World)

        if is_guest:
            if visibility != 'public':
                return None, strings.INVALID_WORLD_VISIBILITY_FILTER
            # guests can only access public worlds that allow guests and are not banned or deleted
            query = query.filter(World.allow_guests.is_(True),
                                 World.status == consts.WORLD_NORMAL_STATUS,
                                 World.public)
        else:
            # for a normal user, it can search for public, joined or created worlds
            if not is_superuser or (is_superuser and visibility):
                query, msg = self.filter_by_visibility(query, visibility, requester_id)
                if query is None:
                    return None, msg
            else:
                # retrieves worlds based on the given status
                query = query.filter(World.status.in_([i for i, s in enumerate([normal, banned, deleted]) if s]))

                # admins can also search for the worlds created by a given user
                if creator:
                    query = query.filter(World.creator == creator)

        query = query.filter(
            or_(World.name.ilike("%" + search + "%"), World.description.ilike("%" + search + "%"))
        )

        if tags:
            query = query.join(World.tags).filter(Tag.name.in_(tags))

        ord = desc if order == 'desc' else asc
        # TODO: change this to add more filters, also change the name of this one it is only an example
        if order_by == 'timestamp':
            query = query.order_by(ord(World.creation_date))

        return query.offset(limit * (page - 1)).limit(limit + 1).all(), ""

    def filter_by_visibility(self, query, visibility: str, requester_id: int):
        # normal users cannot access deleted worlds
        query = query.filter(World.status != consts.WORLD_DELETED_STATUS)

        if visibility == "public":
            # it cannot see the public banned worlds
            query = query.filter(World.public, World.status != consts.WORLD_BANNED_STATUS)
        elif visibility == "joined":
            # if a user has joined a world and it is banned it should have feedback about it
            query = query.join(World.users).filter(User.user_id == requester_id)
        elif visibility == "owned":
            # if a user has created a world that is now banned, the user should have feedback about it
            query = query.filter(World.creator == requester_id)
        else:
            return None, strings.INVALID_WORLD_VISIBILITY_FILTER

        return query, ""

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
