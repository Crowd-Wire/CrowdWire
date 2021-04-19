from typing import Optional
from pydantic import BaseModel, EmailStr, UUID1
import datetime


# Base Attributes shared By All Schemas of User
class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    register_date: Optional[datetime.datetime] = None
    birth: Optional[datetime.date] = None
    status: Optional[int] = None
    is_guest_user: Optional[bool] = False


class GuestUser(UserBase):
    user_id: UUID1
    is_guest_user: bool = True


# schema for Login
class UserInLogin(BaseModel):
    email: EmailStr
    hashed_password: str

    class Config:
        orm_mode = True


# schema for User Creation
class UserCreate(UserBase):
    name: str
    email: EmailStr
    hashed_password: str


# schema for User Update
class UserUpdate(UserBase):
    password: Optional[str] = None


# retrieve User from DB to client via API
class UserInDB(UserBase):
    user_id: Optional[int] = None
    register_date: datetime.datetime

    class Config:
        orm_mode = True
