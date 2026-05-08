from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from schemas import ArticleOut
from services import aggregator

router = APIRouter(prefix="/trending", tags=["trending"])


@router.get("", response_model=list[ArticleOut])
async def get_trending(
    limit: int = Query(5, le=20),
    session: AsyncSession = Depends(get_session),
):
    return await aggregator.get_trending(session, limit=limit)
