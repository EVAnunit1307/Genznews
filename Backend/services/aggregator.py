"""
News aggregation engine — fans out to all 3 APIs in parallel,
normalizes to a common schema, deduplicates by URL, and upserts to SQLite.
In-memory TTL cache avoids hammering APIs on every request.
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from models import Article
from services import newsapi, nytimes, guardian, rss
from config import NEWS_CACHE_TTL_MINUTES

# topic → last refresh timestamp
_cache_ts: dict[str, datetime] = {}


def _is_stale(topic: str) -> bool:
    ts = _cache_ts.get(topic)
    if ts is None:
        return True
    return datetime.utcnow() - ts > timedelta(minutes=NEWS_CACHE_TTL_MINUTES)


async def refresh(topic: str, session: AsyncSession) -> None:
    """Fan out to all 3 APIs, deduplicate, upsert to DB."""
    results = await asyncio.gather(
        newsapi.fetch(topic, limit=15),
        nytimes.fetch(topic, limit=15),
        guardian.fetch(topic, limit=15),
        rss.fetch(topic, limit=15),
        return_exceptions=True,
    )

    seen_urls: set[str] = set()
    articles: list[dict] = []
    for batch in results:
        if isinstance(batch, Exception):
            continue
        for a in batch:
            url = a.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                articles.append(a)

    now = datetime.utcnow()
    for a in articles:
        try:
            stmt = (
                sqlite_insert(Article)
                .values(
                    source=a["source"],
                    source_id=a.get("source_id"),
                    title=a["title"],
                    dek=a.get("dek"),
                    author=a.get("author"),
                    category=a["category"],
                    region=a["region"],
                    url=a["url"],
                    image_url=a.get("image_url"),
                    published_at=a["published_at"],
                    fetched_at=now,
                    read_time=a.get("read_time", 5),
                )
                .on_conflict_do_update(
                    index_elements=["url"],
                    set_={
                        "title": a["title"],
                        "dek": a.get("dek"),
                        "author": a.get("author"),
                        "image_url": a.get("image_url"),
                        "fetched_at": now,
                    },
                )
            )
            await session.execute(stmt)
        except Exception:
            continue

    await session.commit()
    _cache_ts[topic] = now


async def get_articles(
    topic: str,
    session: AsyncSession,
    limit: int = 20,
    offset: int = 0,
) -> list[Article]:
    """Return articles for topic, refreshing from APIs if cache is stale."""
    if _is_stale(topic):
        await refresh(topic, session)

    stmt = select(Article)
    if topic != "all":
        from sqlalchemy import or_
        slug_to_cat = {
            "global": "Global", "us": "US", "canada": "Canada",
            "climate": "Climate", "tech": "Tech", "money": "Money",
            "culture": "Culture", "policy": "Policy", "fashion": "Fashion",
        }
        cat = slug_to_cat.get(topic)
        if cat:
            stmt = stmt.where(
                or_(Article.category == cat, Article.region == cat)
            )

    stmt = stmt.order_by(Article.published_at.desc()).offset(offset).limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_featured(session: AsyncSession) -> Article | None:
    """Return the single most-viewed article as the lead story."""
    if _is_stale("all"):
        await refresh("all", session)
    stmt = select(Article).order_by(Article.published_at.desc()).limit(1)
    result = await session.execute(stmt)
    return result.scalars().first()


async def get_ticker(session: AsyncSession, limit: int = 8) -> list[str]:
    """Return headline strings for the live ticker."""
    stmt = select(Article.title).order_by(Article.published_at.desc()).limit(limit)
    result = await session.execute(stmt)
    return [row[0] for row in result.all()]


async def get_trending(session: AsyncSession, limit: int = 5) -> list[Article]:
    stmt = select(Article).order_by(Article.views.desc(), Article.published_at.desc()).limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())
