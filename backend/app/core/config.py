from pydantic import BaseSettings, PostgresDsn
from typing import Optional


class Settings(BaseSettings):
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = 'CrowdWire'

    SCHEMA_NAME: str = "fastapi"
    POSTGRES_SERVER: str = ""
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = "postgresql://postgres:1234@localhost:5432/postgres"


    class Config:
        env_file = ".env"


settings = Settings()
