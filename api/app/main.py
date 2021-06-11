from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api_v1.api import api_router
from app.core.logging import init_logging
from fastapi.middleware.cors import CORSMiddleware
from app.rabbitmq import rabbit_handler
from app.redis import redis_connector
from app.core.config import settings


def get_application() -> FastAPI:
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
    db = SessionLocal()
    init_db(db)
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.add_event_handler("startup", init_logging)
    app.add_event_handler("startup", redis_connector.sentinel_connection)
    app.add_event_handler("startup", rabbit_handler.start_pool)
    app.include_router(api_router)
    return app


app = get_application()
# if __name__ == "__main__":
# uvicorn.run(app, host="0.0.0.0", port=8000)
