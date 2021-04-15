from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas, crud
from app.api import dependencies as deps
from typing import Any
from fastapi import HTTPException

router = APIRouter()


@router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]
