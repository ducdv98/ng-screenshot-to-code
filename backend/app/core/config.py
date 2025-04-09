import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FIGMA_ACCESS_TOKEN: str = os.getenv("FIGMA_ACCESS_TOKEN", "")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:4200",  # Angular dev server
        "http://localhost:4201",  # Angular dev server alternate port
        "http://localhost:8000",  # FastAPI dev server
    ]
    
    # AI models
    DEFAULT_VLM_PROVIDER: str = os.getenv("DEFAULT_VLM_PROVIDER", "openai")  # "openai", "anthropic", or "gemini"
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-vision-preview")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-pro-vision")
    
    # Application settings
    MAX_IMAGE_SIZE_MB: int = 5
    MAX_CONTENT_LENGTH: int = MAX_IMAGE_SIZE_MB * 1024 * 1024  # in bytes

settings = Settings() 