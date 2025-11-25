from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    await connect_to_mongo()
    yield
    await close_mongo_connection()
    
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)