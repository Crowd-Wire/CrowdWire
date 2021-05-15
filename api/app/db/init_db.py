from sqlalchemy.orm import Session
from sqlalchemy.schema import CreateSchema
from sqlalchemy import event
from app.core.config import settings
from .base import Base, Tag, User
from .session import engine
from datetime import datetime
from app.core.security import get_password_hash
# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28

@event.listens_for(Tag.__table__, "after_create")
def insert_tags(target, connection, **kwargs):
    connection.execute(target.insert().values(name="Science"))
    connection.execute(target.insert().values(name="Technology"))
    connection.execute(target.insert().values(name="Fun"))

@event.listens_for(User.__table__, "after_create")
def insert_users(target, connection, **kwargs):
    # TODO: change this to create the admin from the env variables
    connection.execute(target.insert().values(
        name="Bruno", email=settings.DB_ADMIN_EMAIL, register_date=datetime.now(), status=0, is_superuser=True,
        hashed_password=get_password_hash(settings.DB_ADMIN_PASSWORD)
    ))

def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # TODO: change this so that tables are created with alembic

    # Check Database Schema Creation
    if not engine.dialect.has_schema(engine, schema=settings.SCHEMA_NAME):
        event.listen(Base.metadata, "before_create", CreateSchema(settings.SCHEMA_NAME))

    Base.metadata.reflect(bind=engine, schema=settings.SCHEMA_NAME)
    Base.metadata.create_all(engine, checkfirst=True)


