# Import all the models, so that Base has them before being
# imported by Alembic

# TODO: add all models to this file
from .base_class import Base
from app.models.user import User
