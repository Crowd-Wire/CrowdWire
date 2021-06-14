from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4, Field
import datetime


# Base Attributes shared By All Schemas of User
from typing_extensions import Annotated


class UserBase(BaseModel):
    name: Annotated[Optional[str], Field(max_length=50)] = None
    email: Optional[EmailStr] = None
    register_date: Optional[datetime.datetime] = None
    birth: Optional[datetime.date] = None
    status: Optional[int] = None


class GuestUser(UserBase):
    user_id: UUID4
    is_guest_user: bool = True


# schema for Login
class UserInLogin(BaseModel):
    email: EmailStr
    hashed_password: Annotated[str, Field(max_length=256)]

    class Config:
        orm_mode = True


# schema for User Creation
class UserCreate(UserBase):
    name: Annotated[str, Field(max_length=50)]
    email: EmailStr
    hashed_password: Annotated[str, Field(max_length=256)]


class UserCreateGoogle(UserBase):
    name: Annotated[str, Field(max_length=50)]
    email: EmailStr
    sub: Annotated[str, Field(max_length=50)]


# schema for User Update
class UserUpdate(UserBase):
    pass


# schema to Update User's Password
class UserUpdatePassword(BaseModel):
    old_password: Annotated[str, Field(max_length=256)]
    new_password: Annotated[str, Field(max_length=256)]


# retrieve User from DB to client via API
class UserInDB(BaseModel):
    user_id: int
    register_date: datetime.datetime
    sub: Optional[str]
    name: str
    email: str
    birth: Optional[datetime.date]
    status: int

    class Config:
        orm_mode = True
