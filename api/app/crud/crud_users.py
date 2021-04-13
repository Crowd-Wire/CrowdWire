import datetime
from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.users import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    # Override
    def get(self, db: Session, id: Any) -> Optional[User]:
        """
        Retrieve user by user_id
        """
        return db.query(User).filter(User.user_id == id).first()

    def create(self, db: Session, *, user_data: UserCreate) -> User:
        """
        Creates an User
        """

        if self.get_by_email(db=db, email=user_data.email):
            return None

        db_user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.hashed_password),
            name=user_data.name,
            birth=user_data.birth,
            register_date=datetime.datetime.now(),
            status="0",
            is_superuser=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        Updates a given user
        """

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """
        Authenticates user by comparing password with saved hashed
        """
        db_user = self.get_by_email(db, email=email)
        if not db_user:
            return None
        if not verify_password(password, db_user.hashed_password):
            return None
        return db_user

    # TODO: change imports to be models.User
    def is_active(self, db: Session, *, user: User) -> bool:
        """
        A user is active if it's status is 0
        """

        if user.status == 0:
            return True
        else:
            return False


user = CRUDUser(User)


"""

from typing import Optional
from app.models.user import User
from sqlalchemy.orm import Session
from app import schemas
from datetime import datetime









def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> User:

    db_user = User(
        email=user.email,
        hashed_password=user.hashed_password,
        name=user.name,
        birth=user.birth,
        register_date=user.register_date
        )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
"""
