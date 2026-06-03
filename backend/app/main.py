from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="Sensor API")

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok"}