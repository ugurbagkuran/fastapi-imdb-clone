from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str
    MONGO_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    DB_NAME: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    
    OPENAI_API_KEY: str | None = None
    OPENROUTER_API_KEY: str | None = None
    GROQ_API_KEY: str | None = None
    
    REDIS_URL: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )
        
settings = Settings()
