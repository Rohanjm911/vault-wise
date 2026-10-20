import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    HOST: str = "127.0.0.1"
    PORT: int = 8000
    API_PREFIX: str = "/api/v1"

    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database: Default to SQLite for local development & tests, or PostgreSQL when configured
    DATABASE_URL: str = "sqlite+aiosqlite:///./vaultwise_dev.db"
    DATABASE_URL_SYNC: str = "sqlite:///./vaultwise_dev.db"

    # Security & Tokens
    JWT_SECRET_KEY: str = "vaultwise-insecure-dev-secret-key-change-in-production-12345678"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12

    # Optional AI Analysis (Disabled by default, requires explicit opt-in)
    AI_ANALYSIS_ENABLED: bool = False
    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""

    # Storage & Upload Limits
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_UPLOAD_EXTENSIONS: Union[List[str], str] = [".csv", ".xlsx", ".xls"]

    @field_validator("CORS_ORIGINS", "ALLOWED_UPLOAD_EXTENSIONS", mode="after")
    @classmethod
    def parse_comma_separated_list(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
