from fastapi import FastAPI
import uvicorn

from app.core.logging import InterceptHandler
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api_v1.api import api_router
from app.core.logging import init_logging
import logging
from loguru import logger
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(debug=True)
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

# result = db.query(base.User).first()
# print(result)


if __name__ == "__main__":
    init_logging()
    uvicorn.run(app, host="0.0.0.0", port=8000)
