from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IMDb Clone"
    MONGO_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    
    
    
    class Config:
        env_file = ".env"
        
settings = Settings()