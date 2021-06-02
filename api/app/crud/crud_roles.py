from copy import copy, deepcopy
from typing import Union, Optional, List, Tuple, Any, Dict

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Role, World_User, User, World
from .base import CRUDBase
from app.schemas import RoleCreate, RoleUpdate
from ..core import strings, consts
from ..redis.redis_decorator import cache, clear_cache_by_model
from app.crud import crud_user
from loguru import logger


class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):

    @cache(model="Role")
    async def can_access_world_roles(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user can access the roles of a world
        """
        role = db.query(Role).join(World_User).join(World).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            Role.world_id == world_id,
            or_(Role.role_manage.is_(True), World.creator == user_id)).first()
        if not role:
            return None, strings.ROLE_INVALID_PERMISSIONS
        return role, ""

    @cache(model="Role")
    async def can_access_world_ban(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user can access bans of the world(see reports and ban users from world).
        """
        role = db.query(Role).join(World_User).join(World).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            Role.world_id == world_id,
            or_(Role.ban.is_(True), World.creator == user_id)).first()
        if not role:
            return None, strings.ROLE_INVALID_PERMISSIONS
        return role, ""

    @cache(model="Role")
    async def can_manage_conference(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user can access the roles of a world
        """
        role = db.query(Role).join(World_User).join(World).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            Role.world_id == world_id,
            or_(Role.conference_manage.is_(True), World.creator == user_id)).first()
        if not role:
            return None, strings.ROLE_INVALID_PERMISSIONS
        return role, ""

    @cache(model="Role")
    async def can_talk_conference(self, db: Session, world_id: int, user_id: int):
        """
        Checks if a user can access the roles of a world
        """
        role = db.query(Role).join(World_User).join(World).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            Role.world_id == world_id,
            or_(Role.talk_conference.is_(True), World.creator == user_id)).first()
        if not role:
            return None, strings.ROLE_INVALID_PERMISSIONS
        return role, ""

    async def can_assign_new_role_to_user(
            self, db: Session, world_id: int, request_user: int, user_id: int, is_guest: bool, role_id: int):

        # verifies if the given user is present in the database
        if not is_guest:
            if not crud_user.get(db=db, id=user_id):
                return None, strings.USER_NOT_FOUND

        # verifies if the user can access_roles
        role, msg = await crud_role.can_access_world_roles(db=db, world_id=world_id, user_id=request_user)
        if role is None:
            return None, strings.ACCESS_FORBIDDEN

        # checks if the provided role exists and returns it
        new_role, msg = await crud_role.get_by_role_id(db=db, role_id=role_id)
        if new_role is None:
            return None, msg
        return new_role, ""

    @cache(model="Role")
    async def get_by_role_id_and_world_id(self, db: Session, role_id: int, world_id: int) -> Tuple[Optional[Role], str]:
        role = db.query(Role).filter(Role.role_id == role_id,
                                     Role.world_id == world_id).first()
        if not role:
            return None, strings.ROLES_NOT_FOUND
        return role, ""

    @cache(model="Role")
    async def get_user_role_in_world(self, db: Session, world_id: int, user_id: int) -> Tuple[Optional[Role], str]:

        role = db.query(Role).join(World_User).filter(
            World_User.role_id == Role.role_id,
            World_User.user_id == user_id,
            World_User.world_id == world_id
        ).first()

        if not role:
            return None, strings.ROLES_NOT_FOUND
        return role, ""

    @cache(model="Role")
    async def get_by_role_id(self, db: Session, role_id: int) -> Tuple[Optional[Role], str]:
        role = db.query(Role).filter(Role.role_id == role_id).first()
        if not role:
            return None, strings.ROLES_NOT_FOUND
        return role, ""

    def get_by_name(self, db: Session, world_id: int, name: str) -> Tuple[Optional[Role], str]:
        """
        Gets roles by Name
        """
        role = db.query(Role).filter(Role.world_id == world_id, Role.name == name)
        if not role:
            return None, strings.ROLE_NAME_NOT_FOUND
        return role, ""

    @cache(model="Role")
    async def get_world_roles(
            self,
            db: Session,
            world_id: int
    ) -> Tuple[List[Optional[Role]], str]:
        """
        Returns the Roles created for a given world
        """
        return db.query(Role).filter(Role.world_id == world_id).all(), ""

    def get_world_default(self, db: Session, world_id: int) -> Role:
        """
        Returns the default role for a given world
        """
        return db.query(Role).filter(Role.world_id == world_id, Role.is_default.is_(True)).first()

    async def create(self, db: Session, obj_in: RoleCreate, *args, **kwargs) -> Tuple[Optional[Role], str]:
        """
        Creates a role
        """
        # check if parameter was fullfilled
        request_user = kwargs.get('request_user')
        if not request_user or (request_user and not isinstance(request_user, User)):
            return None, strings.USER_NOT_PASSED
        # Verify if user has permission to edit roles in this world
        role, msg = await self.can_access_world_roles(db=db, world_id=obj_in.world_id, user_id=request_user.user_id)
        if not role:
            return None, msg
        # verify if there's already a role with this name
        role, msg = self.get_by_name(db=db, world_id=obj_in.world_id, name=obj_in.name)
        if not role:
            return None, strings.ROLE_NAME_ALREADY_IN_USE
        # TODO: See this better
        if obj_in.is_default:
            return None, strings.ROLE_DEFAULT_ALREADY_EXISTS

        await clear_cache_by_model("Role", world_id=obj_in.world_id)
        role_obj = super().create(db=db, obj_in=obj_in)
        return role_obj, ""

    def create_default(self, db: Session, world_id: int):
        """
        Create default roles when a world is created
        """
        default_role = Role(
            world_id=world_id,
            name="default",
            is_default=True,
            walk=True,
            talk=True,
            chat=True
        )
        db.add(default_role)
        db.commit()
        return default_role

    async def update(
            self,
            db: Session,
            *,
            db_obj: Role,
            obj_in: Union[RoleUpdate, Dict[str, Any]],
    ) -> Tuple[Optional[Role], str]:

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        if 'world_id' not in update_data:
            return None, ""
        # cannot change default role without setting a new one
        if db_obj.is_default and 'is_default' in update_data and not update_data['is_default']:
            return None, "cannot remove default role"

        # a deepcopy is needed in order to get a new reference to the object dictionary
        # otherwise, the original db_obj would be affected
        new_data = deepcopy(db_obj.__dict__)
        new_data.update(update_data)
        # when trying to change the default role there cannot be some permissions in this role
        if new_data.get('is_default'):
            # the new object in the database cannot have some permissions
            for k, v in new_data.items():
                if v is True and k not in consts.role_default_permissions + ['is_default']:
                    return None, "cannot give this permissions to default role"

            # change old default role to not default
            default_role = self.get_world_default(db=db, world_id=obj_in['world_id'])
            if default_role.role_id != db_obj.role_id:
                default_role.is_default = False
                db.add(default_role)
                db.commit()

        await clear_cache_by_model('Role', world_id=db_obj.world_id)
        role_updated = super().update(db=db, db_obj=db_obj, obj_in=obj_in)
        return role_updated, strings.ROLE_UPDATED_SUCCESS

    async def remove(self, db: Session, *, role_id: int, world_id: int = None, user_id: int = None) \
            -> Tuple[Optional[Role], str]:
        # TODO: Check a better way to fix this circular import
        from app.crud.crud_world_users import crud_world_user
        if world_id and role_id:
            role, msg = await crud_role.get_by_role_id(db=db, role_id=role_id)
            if not role:
                return None, msg
            if role.is_default:
                return None, strings.ROLE_DEFAULT_DELETE_FORBIDDEN
            default_role = self.get_world_default(db=db, world_id=world_id)
            # Before Deleting, change the role to the default one
            crud_world_user.change_roles(
                db=db, world_id=world_id,
                role_to_change_id=default_role.role_id,
                role_changed_id=role_id)
            role_obj = super().remove(db=db, id=role_id)
            await clear_cache_by_model('Role', world_id=world_id)
            return role_obj, strings.ROLE_DELETED_SUCCESS
        return None, ""


crud_role = CRUDRole(Role)
