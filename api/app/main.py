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

app = FastAPI(debug=True)
app.add_middleware(SessionMiddleware, secret_key="!secret")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
db = SessionLocal()
init_db(db)

app.include_router(api_router)


if __name__ == "__main__":
    init_logging()
    app.add_event_handler("startup", rabbit_handler.start_pool)
    app.add_event_handler('startup', redis_connector.sentinel_connection)
    uvicorn.run(app, host="0.0.0.0", port=8000)
