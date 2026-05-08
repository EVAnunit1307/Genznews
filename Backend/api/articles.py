from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from database import get_session
from models import Article
from schemas import ArticleOut
from services import aggregator

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[ArticleOut])
async def list_articles(
    topic: str = Query("all"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    session: AsyncSession = Depends(get_session),
):
    return await aggregator.get_articles(topic, session, limit=limit, offset=offset)


@router.get("/featured", response_model=ArticleOut)
async def get_featured(session: AsyncSession = Depends(get_session)):
    article = await aggregator.get_featured(session)
    if not article:
        raise HTTPException(status_code=404, detail="No articles yet")
    return article


@router.get("/ticker")
async def get_ticker(session: AsyncSession = Depends(get_session)):
    headlines = await aggregator.get_ticker(session)
    return {"items": headlines}


@router.get("/{article_id}", response_model=ArticleOut)
async def get_article(article_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Article).where(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    # increment view count
    await session.execute(
        update(Article).where(Article.id == article_id).values(views=Article.views + 1)
    )
    await session.commit()
    await session.refresh(article)
    return article
