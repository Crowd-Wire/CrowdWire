
from fastapi import FastAPI
import uvicorn
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import engine, SessionLocal
import app.db.base as base
from app.db.init_db import init_db
from app.api.api_v1.api import api_router

app = FastAPI()
db = SessionLocal()
init_db(db)

app.include_router(api_router)

#result = db.query(base.User).first()
#print(result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

