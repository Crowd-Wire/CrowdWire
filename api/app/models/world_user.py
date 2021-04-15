from app.db.base_class import Base
from sqlalchemy import ForeignKey, Integer, Column, String, TIMESTAMP, Table
from app.core.config import settings

"""
Many to Many between world and user. Keeps information about a user in a world.
"""

world_user = Table(
    "world_user",
    Base.metadata,
    Column(
        "user_id",
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".user.user_id"),
        primary_key=True,
        index=True,
    ),
    Column(
        "world_id",
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".world.world_id"),
        primary_key=True,
        index=True,
    ),
    Column(
        "role_id",
        Integer,
        ForeignKey(settings.SCHEMA_NAME + ".role.role_id"),
        nullable=False
    ),
    Column("avatar", String(50)),
    Column("join_date", TIMESTAMP),
    Column("n_joins", Integer, nullable=False),
    Column("last_join", TIMESTAMP, nullable=False),
    Column("status", Integer, nullable=False),
    Column("username", String(50), nullable=False),
    schema=settings.SCHEMA_NAME,
)
