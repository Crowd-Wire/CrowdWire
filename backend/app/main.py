from fastapi import FastAPI
import uvicorn

from app.core.logging import InterceptHandler
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.api_v1.api import api_router
from app.core import logging as lg
import  logging
from loguru import logger

app = FastAPI()
db = SessionLocal()
init_db(db)

app.include_router(api_router)

# result = db.query(base.User).first()
# print(result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
