from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import dependencies as deps
from app import models
router = APIRouter()

