import datetime
from typing import Any, Dict, Optional, Union, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
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

    def is_pending(self, db: Session, user_id: int):

        user = self.get(db=db, id=user_id)
        if not user or user.status != consts.USER_PENDING_STATUS:
            return None
        return user

    def filter(
            self, db: Session, email: str, banned: bool, normal: bool, order_by: str, order: str, page: int, limit: int
    ):
        """
        Filters the users of the platform. This endpoint can only be used by the admin.
        """
        if page < 1:
            return None, strings.INVALID_PAGE_NUMBER

        query = db.query(User)

        if email:
            query = query.filter(User.email.ilike(email + '%'))

        # checks for banned and normal
        query = query.filter(User.status.in_([i for i, s in enumerate([normal, banned]) if s]))

        ord = desc if order == 'desc' else asc

        # add more later
        if order_by == 'register_date':
            query = query.order_by(ord(User.register_date))

        reports = query.offset(limit * (page - 1)).limit(limit + 1).all()

        return reports, ""

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

        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.hashed_password),
            name=user_data.name,
            birth=user_data.birth,
            register_date=datetime.datetime.now(),
            status=consts.USER_PENDING_STATUS,  # pending
            is_superuser=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user, strings.USER_REGISTERED_SUCCESS

    def confirm_email(self, db: Session, user_id: int):

        user = self.get(db=db, id=user_id)
        if not user:
            return None, strings.USER_NOT_FOUND

        user.status = 0
        db.add(user)
        db.commit()

        return user, ""

    def create_google(self, db: Session, user: UserCreateGoogle) -> Tuple[Optional[User], str]:

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

    def get_sub(self, db: Session, sub: int) -> Optional[User]:

        return db.query(User).filter(User.sub == sub).first()

    def google_auth(self, db: Session, user) -> Tuple[Optional[User], str]:
        """
        Verifies if the google user already exists and returns it else creates user.
        A User cannot be normally registered in the application and then try to login with google.
        """

        user_db = self.get_sub(db=db, sub=user.get('sub'))

        if user_db and self.get_by_email(db=db, email=user_db.email).sub != user_db.sub:
            # If there is already an account with that google email that is not linked to google
            return None, strings.GOOGLE_EMAIL_ALREADY_REGISTERED

        if not user_db:
            # User is not registered
            # Create an account
            user_create = UserCreateGoogle(
                email=user.get('email'), name=user.get('name'), sub=user.get('sub')
            )
            return crud_user.create_google(db=db, user=user_create)

        return user_db, strings.AUTHENTICATION_SUCCESS

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
        # verify if email already exists
        if 'email' in update_data:
            obj = self.get_by_email(db=db, email=update_data['email'])
            if obj and obj.email != db_obj.email:
                return None, strings.EMAIl_ALREADY_IN_USE

        # no need to return any error here
        # only superusers may update the status of the user
        if not request_user.is_superuser:
            if 'status' in update_data:
                del update_data['status']
            if 'is_guest_user' in update_data:
                del update_data['is_guest_user']
        updated_obj = super().update(db, db_obj=db_obj, obj_in=update_data)
        return updated_obj, strings.USER_EDITED_SUCCESS

    def update_password(self, db: Session, db_obj: User,
                        obj_in: Union[UserUpdate, Dict[str, Any]]) -> Tuple[Optional[User], str]:

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if 'old_password' in update_data and 'new_password' in update_data:
            # first verify if the old password is right
            if not verify_password(update_data['old_password'], db_obj.hashed_password):
                return None, strings.INVALID_PASSWORD
            # update the data_passed in order to store only the hash of the password in the database
            hashed_password = get_password_hash(update_data["new_password"])
            del update_data["new_password"]
            del update_data["old_password"]
            update_data["hashed_password"] = hashed_password

        updated_obj = super().update(db, db_obj=db_obj, obj_in=update_data)
        return updated_obj, strings.PASSWORD_CHANGED_SUCCESS

    def authenticate(self, db: Session, *, email: str, password: str) -> Tuple[Optional[User], str]:
        """
        Authenticates user by comparing password with saved hashed
        """
        db_user = self.get_by_email(db, email=email)
        if not db_user or not verify_password(password, db_user.hashed_password):
            return None, strings.INVALID_CREDENTIALS
        return db_user, strings.AUTHENTICATION_SUCCESS

    def is_active(self, db: Session, *, user: User) -> bool:
        """
        A user is active if it's status is 0
        """

        if user.status == 0:
            return True
        else:
            return False


crud_user = CRUDUser(User)
