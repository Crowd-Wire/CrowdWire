import datetime
from typing import Optional, Tuple, List

from sqlalchemy.orm import Session

from app.models.event import Event
from .crud_world_users import crud_world_user
from ..core import strings

"""
Events dont follow the same CRUD Rules from the Base Class
since they cannot be created/updated/deleted through the REST API
"""


class CRUDEvents:

    def get_all_by_world_id(self, db: Session, world_id: int) -> Optional[List[Event]]:
        return db.query(Event).filter(Event.world_id == world_id).all()

    def create(
            self,
            db: Session,
            world_id: int,
            user_id: int,
            event_type: str) -> Tuple[Optional[Event], str]:
        if not crud_world_user.get_user_joined(db=db, world_id=world_id, user_id=user_id):
            return None, strings.USER_NOT_IN_WORLD

        db_event = Event(
            world_id=world_id,
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.datetime.now()
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event, strings.EVENT_CREATED_SUCCESS


crud_event = CRUDEvents()
