from pydantic import BaseSettings, PostgresDsn
from typing import Optional
import secrets


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    PROJECT_NAME: str = "CrowdWire"

    # TODO: Change this
    # testing
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 2

    SCHEMA_NAME: str = "fastapi"
    POSTGRES_SERVER: str = ""
    POSTGRES_USER: str = ""
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    SQLALCHEMY_DATABASE_URI: Optional[
        PostgresDsn
    ] = "postgresql://postgres:1234@localhost:5432/postgres"

    RABBITMQ_USER: str = "user"
    RABBITMQ_PASSWORD: str = "bitnami"
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_SENDING_QUEUE: str = "SendingQueue"
    RABBITMQ_URI: str = f"amqp://" \
                        f"{RABBITMQ_USER}:{RABBITMQ_PASSWORD}" \
                        f"@{RABBITMQ_HOST}:5672/"

    # searches this file to find the variables
    class Config:
        env_file = ".env"


settings = Settings()
