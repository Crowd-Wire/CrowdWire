from typing import Optional, Union
from datetime import datetime
from pydantic import BaseModel, UUID4


class Token(BaseModel):
    access_token: str
    token_type: str
    expire_date: str


class TokenGuest(Token):
    # It is useful to return the uuid to the client
    # so that we can refresh tokens for a Guest
    guest_uuid: UUID4


class TokenPayload(BaseModel):
    # Guest Users ID is not an integer
    sub: Union[int, UUID4] = None
    is_guest_user: Optional[bool] = False
    exp: Optional[datetime] = None


class InviteTokenPayload(BaseModel):
    # Invites can only be done be registered users, therefore the subject
    # is of type int and not UUID4(the type for guest users)
    inviter: int
    world_id: int
