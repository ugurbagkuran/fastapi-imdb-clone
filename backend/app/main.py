from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.services.movies.routes import router as movies_router
from app.services.auth.routes import router as auth_router
from app.services.reviews.routes import router as reviews_router
from app.services.agent.router import router as agent_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    
    await connect_to_mongo()
    yield
    await close_mongo_connection()
    
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]





app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Hangi adreslerden istek gelebilir?
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PUT, DELETE... hepsine izin ver
    allow_headers=["*"],   # Tüm başlıklara izin ver
)





app.include_router(reviews_router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(movies_router, prefix="/api/movies", tags=["Movies"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)