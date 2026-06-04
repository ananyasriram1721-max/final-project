from sqlalchemy import Column, Integer, Float, DateTime, Boolean
from datetime import datetime, timezone
from app.database import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    predicted_temperature = Column(Float, nullable=True)
    ir_detected = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))