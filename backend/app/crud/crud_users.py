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