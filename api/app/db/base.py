# Import all the models, so that Base has them before being
# imported by Alembic

# TODO: add all models to this file
from .base_class import Base
from app.models.user import User
from app.models.tag import Tag
from app.models.world import World
from app.models.world_tag import world_tag
from app.models.user_settings import User_Settings
from app.models.world_settings import World_Settings
from app.models.role import Role
from app.models.world_user import world_user
