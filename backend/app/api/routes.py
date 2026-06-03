from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal, engine
from app import models
from app.schema import SensorDataCreate, SensorDataResponse

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


@router.post("/sensors", response_model=SensorDataResponse)
def create_sensor_data(sensor: SensorDataCreate, db: Session = Depends(get_db)):
    """Create a new sensor reading"""
    db_sensor = models.SensorData(
        temperature=sensor.temperature,
        humidity=sensor.humidity
    )
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor


@router.get("/sensors", response_model=List[SensorDataResponse])
def list_sensor_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all sensor readings"""
    sensors = db.query(models.SensorData).offset(skip).limit(limit).all()
    return sensors


@router.get("/sensors/{sensor_id}", response_model=SensorDataResponse)
def get_sensor_data(sensor_id: int, db: Session = Depends(get_db)):
    """Get a specific sensor reading by ID"""
    sensor = db.query(models.SensorData).filter(models.SensorData.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    return sensor


@router.delete("/sensors/{sensor_id}")
def delete_sensor_data(sensor_id: int, db: Session = Depends(get_db)):
    """Delete a sensor reading"""
    sensor = db.query(models.SensorData).filter(models.SensorData.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    db.delete(sensor)
    db.commit()
    return {"message": "Sensor data deleted"}