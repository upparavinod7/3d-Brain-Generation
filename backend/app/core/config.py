import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "3D Brain Generation AI Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Storage settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "storage/uploads")
    PROCESSED_DIR: str = os.getenv("PROCESSED_DIR", "storage/processed")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "storage/outputs")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-3d-brain-gen-miccai-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for path in [settings.UPLOAD_DIR, settings.PROCESSED_DIR, settings.OUTPUT_DIR]:
    os.makedirs(path, exist_ok=True)
