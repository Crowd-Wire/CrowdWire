from sqlalchemy.orm import Session
from sqlalchemy.schema import CreateSchema
from sqlalchemy import event
from app.core.config import settings
from .base import Base, Tag, User, Role, World, World_User
from .session import engine
from datetime import datetime
from app.core.security import get_password_hash
from app.utils import choose_avatar


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


@event.listens_for(Tag.__table__, "after_create")
def insert_tags(target, connection, **kwargs):
    connection.execute(target.insert().values(name="Science"))
    connection.execute(target.insert().values(name="Technology"))
    connection.execute(target.insert().values(name="Fun"))
    connection.execute(target.insert().values(name="Office"))
    connection.execute(target.insert().values(name="Education"))
    connection.execute(target.insert().values(name="Social"))


@event.listens_for(User.__table__, "after_create")
def insert_users(target, connection, **kwargs):
    # USER CREATION
    connection.execute(target.insert().values(
        name="Admin", email=settings.DB_ADMIN_EMAIL, register_date=datetime.now(), status=0, is_superuser=True,
        hashed_password=get_password_hash(settings.DB_ADMIN_PASSWORD)
    ))
    connection.execute(target.insert().values(
        name="User1", email="user1@example.com", register_date=datetime.now(), status=0, is_superuser=False,
        hashed_password=get_password_hash("string")
    ))
    connection.execute(target.insert().values(
        name="User2", email="speaker@example.com", register_date=datetime.now(), status=0, is_superuser=False,
        hashed_password=get_password_hash("string")
    ))


@event.listens_for(World.__table__, "after_create")
def insert_worlds(target, connection, **kwargs):
    # WORLD CREATION
    connection.execute(World.__table__.insert().values(
        creator=1, name="Normal World", creation_date=datetime.now(), max_users=10, public=True, allow_guests=True,
        world_map=bytes(open("static/maps/deti.json", 'r').read().encode()), status=0
    ))


@event.listens_for(Role.__table__, "after_create")
def insert_roles(target, connection, **kwargs):
    # ROLE CREATION
    connection.execute(Role.__table__.insert().values(
        world_id=1, name="default", is_default=True, interact=False, walk=True, talk=True, talk_conference=False,
        world_mute=False, role_manage=False, conference_manage=False, chat=True, invite=False, ban=False
    ))
    connection.execute(Role.__table__.insert().values(
        world_id=1, name="conference", is_default=True, interact=False, walk=True, talk=True, talk_conference=True,
        world_mute=False, role_manage=False, conference_manage=True, chat=True, invite=False, ban=False
    ))


@event.listens_for(World_User.__table__, "after_create")
def insert_world_users(target, connection, **kwargs):
    # WORLD_USER CREATION
    connection.execute(World_User.__table__.insert().values(
        user_id=1, world_id=1, role_id=1, join_date=datetime.now(), n_joins=1, last_join=datetime.now(),
        status=0, username="ADMIN", avatar=choose_avatar()
    ))
    connection.execute(World_User.__table__.insert().values(
        user_id=2, world_id=1, role_id=1, join_date=datetime.now(), n_joins=1, last_join=datetime.now(),
        status=0, username="NORMAL", avatar=choose_avatar()
    ))
    connection.execute(World_User.__table__.insert().values(
        user_id=3, world_id=1, role_id=2, join_date=datetime.now(), n_joins=1, last_join=datetime.now(),
        status=0, username="SPEAKER", avatar=choose_avatar()
    ))


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line

    # Check Database Schema Creation
    if not engine.dialect.has_schema(engine, schema=settings.SCHEMA_NAME):
        event.listen(Base.metadata, "before_create", CreateSchema(settings.SCHEMA_NAME))

    Base.metadata.reflect(bind=engine, schema=settings.SCHEMA_NAME)
    Base.metadata.create_all(engine, checkfirst=True)
