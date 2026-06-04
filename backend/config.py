from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings



class Settings(BaseSettings):
    PROJECT_NAME: str = "GhostTunn"
    DATABASE_URL: AnyUrl = Field("sqlite+aiosqlite:///./ghosttunn.db", env="DATABASE_URL")
    REDIS_URL: AnyUrl = Field("redis://redis:6379/0", env="REDIS_URL")
    SECRET_KEY: str = Field("replace-with-production-secret", env="SECRET_KEY")
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")

    class Config:
        env_file = ".env"


settings = Settings()
