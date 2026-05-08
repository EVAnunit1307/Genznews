import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import DATABASE_URL, PORT
from database import init_db
from api import articles, opinions, search, drafts, newsletter, auth, trending


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(DATABASE_URL)
    yield


app = FastAPI(
    title="genzthinks API",
    description="News aggregation + opinion platform for Gen Z",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router, prefix="/api")
app.include_router(opinions.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(drafts.router, prefix="/api")
app.include_router(newsletter.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(trending.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "genzthinks"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
