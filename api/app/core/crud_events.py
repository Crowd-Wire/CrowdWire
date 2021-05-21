from typing import Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.event import Event
from app.schemas.events import EventUpdate, EventCreate


class CRUDEvents(CRUDBase[Event,EventCreate, EventUpdate]):

    def get_by_world_id(self, db: Session, world_id: int) -> Optional[Event]:
        return db.query(Event).filter(Event.world_id == world_id).first()

