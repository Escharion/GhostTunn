import re
from pydantic import Field

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GhostTunn"
    DATABASE_URL: str = Field("sqlite+aiosqlite:///./ghosttunn.db", env="DATABASE_URL")
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    SECRET_KEY: str = Field("replace-with-production-secret", env="SECRET_KEY")
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = re.sub(r"^postgres(ql)?://", "postgresql+asyncpg://", url)
            url = re.sub(r"\?sslmode=\w+", "", url)
            url = re.sub(r"&sslmode=\w+", "", url)
        return url

    class Config:
        env_file = ".env"


settings = Settings()
