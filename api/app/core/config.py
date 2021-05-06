import os

from pydantic import BaseSettings, PostgresDsn
from typing import Optional
import secrets


class Settings(BaseSettings):
    RUNNING_MODE: str = os.environ.get("RUNNING_MODE", None)
    PRODUCTION = RUNNING_MODE is not None and RUNNING_MODE.lower() == 'production'
    DEBUG = not PRODUCTION
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    INVITE_SECRET_TOKEN: str = secrets.token_urlsafe(32)
    PROJECT_NAME: str = "CrowdWire"

    # TODO: Change this
    # testing
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    ACCESS_GUEST_TOKEN_EXPIRE_HOURS: int = 12  # 12 hours For Guests

    SCHEMA_NAME: str = "fastapi"
    POSTGRES_SERVICE_NAME: str = os.getenv('POSTGRES_SERVICE_NAME', 'localhost')
    POSTGRES_USER: str = os.getenv('POSTGRES_USER', "postgres")
    POSTGRES_PASSWORD: str = os.getenv('POSTGRES_PASSWORD', "1234")
    POSTGRES_DB: str = os.getenv('POSTGRES_DB', "postgres")
    SQLALCHEMY_DATABASE_URI: Optional[
        PostgresDsn
    ] = f"postgresql://{POSTGRES_USER}" \
        f":{POSTGRES_PASSWORD}@{POSTGRES_SERVICE_NAME}" \
        f":5432/{POSTGRES_DB}"

    RABBITMQ_USERNAME: str = os.getenv('RABBITMQ_USERNAME', 'user')
    RABBITMQ_PASSWORD: str = "bitnami"
    RABBITMQ_SERVICE_NAME: str = os.getenv('RABBITMQ_SERVICE_NAME', "localhost")
    RABBITMQ_URI: str = f"amqp://" \
                        f"{RABBITMQ_USERNAME}:{RABBITMQ_PASSWORD}" \
                        f"@{RABBITMQ_SERVICE_NAME}:5672/"

    RABBITMQ_SENDING_QUEUE: str = "media_server_queue"
    RABBITMQ_RECEIVING_QUEUE: str = "rest_api_queue"
    REDIS_SENTINEL_HOST: str = os.getenv('REDIS_SENTINEL_HOST', 'localhost')
    REDIS_SENTINEL_PORT: int = 26379
    REDIS_SENTINEL_PASSWORD: str = os.getenv('REDIS_SENTINEL_PASSWORD', 'password')
    REDIS_MASTER: str = 'mymaster'

    CLIENT_ID: str = ""
    CLIENT_SECRET: str = ""

    # searches this file to find the variables
    class Config:
        env_file = ".env"


settings = Settings()
