from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from database import get_session
from models import Article, Opinion
from schemas import ArticleOut, OpinionOut, SearchResults

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResults)
async def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, le=50),
    session: AsyncSession = Depends(get_session),
):
    term = f"%{q}%"

    # Full-text search across articles
    art_stmt = (
        select(Article)
        .where(
            or_(
                Article.title.ilike(term),
                Article.dek.ilike(term),
                Article.author.ilike(term),
                Article.category.ilike(term),
            )
        )
        .order_by(Article.published_at.desc())
        .limit(limit)
    )
    art_result = await session.execute(art_stmt)
    articles = list(art_result.scalars().all())

    # Full-text search across opinions
    op_stmt = (
        select(Opinion)
        .where(
            or_(
                Opinion.title.ilike(term),
                Opinion.excerpt.ilike(term),
                Opinion.author_name.ilike(term),
                Opinion.tag.ilike(term),
            )
        )
        .where(Opinion.status == "published")
        .order_by(Opinion.created_at.desc())
        .limit(limit)
    )
    op_result = await session.execute(op_stmt)
    opinions = list(op_result.scalars().all())

    return SearchResults(
        query=q,
        articles=articles,
        opinions=opinions,
        total=len(articles) + len(opinions),
    )
