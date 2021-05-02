import datetime
from typing import Any, Dict, Optional, Union, Tuple

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.users import UserCreate, UserUpdate, UserCreateGoogle
from app.core import strings, consts


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    # Override
    def get(self, db: Session, id: Any) -> Optional[User]:
        """
        Retrieve user by user_id
        """
        return db.query(User).filter(User.user_id == id).first()

    def can_update(self, request_user: User, db: Session, id: int) -> Tuple[Optional[User], str]:
        user_obj = self.get(db=db, id=id)
        if not user_obj:
            return user_obj, strings.USER_NOT_FOUND
        if request_user.user_id != id and not request_user.is_superuser:
            return None, strings.USER_EDITION_FORBIDDEN
        return user_obj, ""

    def create(self, db: Session, user_data: UserCreate, *args, **kwargs) -> Tuple[Optional[User], str]:
        """
        Creates an User
        @return: An User Object(or None if it does not exist),
                 and a message
        """

        if self.get_by_email(db=db, email=user_data.email):
            return None, strings.EMAIl_ALREADY_IN_USE

        if user_data.status != consts.USER_NORMAL_STATUS:
            return None, strings.INVALID_USER_CREATION_STATUS

        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.hashed_password),
            name=user_data.name,
            birth=user_data.birth,
            register_date=datetime.datetime.now(),
            status=0,
            is_superuser=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user, strings.USER_REGISTERED_SUCCESS

    def create_google(self, db: Session, user: UserCreateGoogle):

        if self.get_sub(db=db, sub=user.sub):
            return None, strings.GOOGLE_USER_ALREADY_REGISTERED

        db_user = User(
            email=user.email,
            name=user.name,
            status=0,
            register_date=datetime.datetime.now(),
            is_superuser=False,
            birth=user.birth,
            sub=user.sub
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user, strings.USER_REGISTERED_SUCCESS

    def get_sub(self, db: Session, sub: int):

        return db.query(User).filter(User.sub == sub).first()


    def update(
            self, db: Session, db_obj: User,
            obj_in: Union[UserUpdate, Dict[str, Any]], *args, **kwargs
    ) -> Tuple[Optional[User], str]:
        """
        Updates a given user
        """
        request_user = kwargs.get('request_user')
        if not request_user or (request_user and not isinstance(request_user, User)):
            return None, strings.USER_NOT_PASSED

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if 'password' in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        # no need to return any error here
        if not request_user.is_superuser:
            if 'status' in update_data:
                del update_data['status']
            if 'is_guest_user' in update_data:
                del update_data['is_guest_user']

        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Tuple[Optional[User], str]:
        """
        Authenticates user by comparing password with saved hashed
        """
        db_user = self.get_by_email(db, email=email)
        if not db_user or not verify_password(password, db_user.hashed_password):
            return None, strings.INVALID_CREDENTIALS
        return db_user, strings.AUTHENTICATION_SUCCESS

    # TODO: change imports to be models.User
    def is_active(self, db: Session, *, user: User) -> bool:
        """
        A user is active if it's status is 0
        """

        if user.status == 0:
            return True
        else:
            return False


crud_user = CRUDUser(User)
