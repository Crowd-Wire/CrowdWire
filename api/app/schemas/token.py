from typing import Optional, Union

from pydantic import BaseModel, UUID1


class Token(BaseModel):
    access_token: str
    token_type: str
    expire_date: str


class TokenGuest(Token):
    # It is useful to return the uuid to the client
    # so that we can refresh tokens for a Guest
    guest_uuid: UUID1


class TokenPayload(BaseModel):
    # Guest Users ID is not an integer
    sub: Union[int, UUID1] = None
    is_guest_user: Optional[bool] = False
