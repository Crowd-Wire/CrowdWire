from fastapi import FastAPI
import uvicorn
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api_v1.api import api_router
from app.core.logging import init_logging
from fastapi.middleware.cors import CORSMiddleware
from app.rabbitmq import rabbit_handler
from app.redis import redis_connector
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings

if settings.PRODUCTION:
    app = FastAPI(root_path=settings.API_V1_STR)
else:
    app = FastAPI(debug=True)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key="!secret"
)
db = SessionLocal()
init_db(db)

app.include_router(api_router)


if __name__ == "__main__":
    init_logging()
    app.add_event_handler("startup", rabbit_handler.start_pool)
    app.add_event_handler('startup', redis_connector.sentinel_connection)
    uvicorn.run(app, host="0.0.0.0", port=8000)
