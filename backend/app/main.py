from fastapi import FastAPI

from typing import Optional
from sqlalchemy.orm import Session

import sys
sys.path.append('..')

from app.db import session


app = FastAPI()

db = session.SessionLocal()

