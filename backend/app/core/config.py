"""
Configuration settings for the application.
Loads environment variables and provides configuration options.
"""
from typing import List
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Financial App"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # API settings
    API_PREFIX: str = "/api"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # React+Vite default port
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "")
    ]
    
    # JWT Auth settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # MongoDB settings
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "financial_app")
    
    # External API keys
    FMP_API_KEY: str = os.getenv("FMP_API_KEY", "bGOQXLTSb18ZjlrgcuQSEXJCcT2nmrZY")
    FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY", "cvdqju1r01qm9khmllb0cvdqju1r01qm9khmllbg")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AIzaSyC-KWhYROSHFay-X-VeBNIp3OAgpSbZa7o")
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    class Config:
        case_sensitive = True
        env_file = ".env",
        extra = 'allow'

settings = Settings()