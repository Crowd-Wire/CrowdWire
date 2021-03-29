from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from loguru import  logger
from ..core.config import settings


# connection to the postgres database
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
logger.info("Succesfully connected to Database")
