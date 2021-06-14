# Import all the models, so that Base has them before being
# imported by Alembic

from .base_class import Base
from app.models.user import User
from app.models.tag import Tag
from app.models.world import World
from app.models.world_tag import world_tag
from app.models.role import Role
from app.models.world_user import World_User
from app.models.event import Event
from app.models.report_user import Report_User
from app.models.report_world import Report_World
