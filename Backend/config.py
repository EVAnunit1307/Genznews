import os
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_KEY: str = os.getenv("NEWSAPI_KEY", "")
NYTIMES_KEY: str = os.getenv("NYTIMES_KEY", "")
GUARDIAN_KEY: str = os.getenv("GUARDIAN_KEY", "test")
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./genzthinks.db")
NEWS_CACHE_TTL_MINUTES: int = int(os.getenv("NEWS_CACHE_TTL_MINUTES", "30"))
PORT: int = int(os.getenv("PORT", "8000"))

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
