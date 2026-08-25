import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "3D Brain Generation AI Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    BACKEND_PUBLIC_URL: str = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")
    
    # Storage settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "storage/uploads")
    PROCESSED_DIR: str = os.getenv("PROCESSED_DIR", "storage/processed")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "storage/outputs")
    
    # Security & API Keys
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-3d-brain-gen-miccai-2026")
    API_KEY: str = os.getenv("API_KEY", "neuroforge_live_api_key_2026_x89f")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for path in [settings.UPLOAD_DIR, settings.PROCESSED_DIR, settings.OUTPUT_DIR]:
    os.makedirs(path, exist_ok=True)
