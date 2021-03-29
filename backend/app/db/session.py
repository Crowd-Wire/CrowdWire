from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from ..core.config import settings


# connection to the postgres database
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

