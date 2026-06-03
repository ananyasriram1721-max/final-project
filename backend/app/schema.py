from pydantic import BaseModel
from datetime import datetime

class SensorDataCreate(BaseModel):
    temperature: float
    humidity: float

class SensorDataResponse(BaseModel):
    id: int
    temperature: float
    humidity: float
    timestamp: datetime

    class Config:
        from_attributes = True