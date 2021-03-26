from typing import *
from pydantic import BaseModel, EmailStr, HttpUrl
import datetime

class UserInLogin(BaseModel):
    email: EmailStr
    hashed_password: str
    class Config:
        orm_mode = True

class UserCreate(UserInLogin):
    name: str
    register_date: Optional[datetime.datetime] = None
    birth: Optional[datetime.date] = None

class UserInUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    register_date: Optional[datetime.date] = None
    birth: Optional[datetime.date] = None