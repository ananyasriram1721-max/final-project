from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app import models, schemas

router = APIRouter()

models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/health")
def health():
    return {"status": "ok"}