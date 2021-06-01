from typing import Optional
from pydantic import BaseModel, EmailStr, UUID4
import datetime


# Base Attributes shared By All Schemas of User
class UserBase(BaseModel):
    name: Optional[str] = None
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
    hashed_password: str

    class Config:
        orm_mode = True


# schema for User Creation
class UserCreate(UserBase):
    name: str
    email: EmailStr
    hashed_password: str


class UserCreateGoogle(UserBase):
    name: str
    email: EmailStr
    sub: str


# schema for User Update
class UserUpdate(UserBase):
    password: Optional[str] = None


# retrieve User from DB to client via API
class UserInDB(BaseModel):
    user_id: int
    register_date: datetime.datetime
    name: str
    email: str
    birth: Optional[datetime.date]
    status: int

    class Config:
        orm_mode = True
