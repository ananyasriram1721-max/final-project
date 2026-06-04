from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SensorDataCreate(BaseModel):
    temperature: float
    humidity: float
    predicted_temperature: Optional[float] = None
    ir_detected: Optional[bool] = False

class SensorDataResponse(BaseModel):
    id: int
    temperature: float
    humidity: float
    predicted_temperature: Optional[float] = None
    ir_detected: bool = False
    timestamp: datetime

    class Config:
        from_attributes = True