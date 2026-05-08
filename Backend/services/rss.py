"""RSS feed integration for fashion sources (Hypebeast, Vogue)."""
import asyncio
import feedparser
from datetime import datetime
from email.utils import parsedate_to_datetime


_FEEDS = [
    {
        "url": "https://hypebeast.com/feed",
        "source": "hypebeast",
        "category": "Fashion",
        "region": "Global",
    },
    {
        "url": "https://www.vogue.com/feed/rss",
        "source": "vogue",
        "category": "Fashion",
        "region": "Global",
    },
]

# Only fetch these feeds for fashion/culture topics
_TOPIC_FEEDS = {
    "fashion": _FEEDS,
    "culture": [_FEEDS[0]],  # Hypebeast only for culture
    "all": _FEEDS,
}


async def fetch(topic: str = "fashion", limit: int = 15) -> list[dict]:
    feeds = _TOPIC_FEEDS.get(topic, [])
    if not feeds:
        return []

    tasks = [_fetch_one(f, limit) for f in feeds]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    articles = []
    for batch in results:
        if isinstance(batch, Exception):
            continue
        articles.extend(batch)
    return articles


async def _fetch_one(feed_cfg: dict, limit: int) -> list[dict]:
    url = feed_cfg["url"]
    try:
        loop = asyncio.get_event_loop()
        parsed = await loop.run_in_executor(None, feedparser.parse, url)
        return [
            _normalize(entry, feed_cfg)
            for entry in parsed.entries[:limit]
            if entry.get("title") and entry.get("link")
        ]
    except Exception:
        return []


def _normalize(entry: dict, feed_cfg: dict) -> dict:
    published_at = datetime.utcnow()
    raw_date = entry.get("published") or entry.get("updated") or ""
    if raw_date:
        try:
            published_at = parsedate_to_datetime(raw_date).replace(tzinfo=None)
        except Exception:
            try:
                published_at = datetime(*entry.get("published_parsed", ())[:6])
            except Exception:
                pass

    summary = entry.get("summary") or ""
    # Strip basic HTML tags from summary
    import re
    summary = re.sub(r"<[^>]+>", "", summary).strip()

    # Grab the first <img> or media thumbnail
    image_url = None
    media = entry.get("media_content") or entry.get("media_thumbnail") or []
    if media:
        image_url = media[0].get("url")
    if not image_url:
        for enc in entry.get("enclosures", []):
            if enc.get("type", "").startswith("image"):
                image_url = enc.get("href") or enc.get("url")
                break

    content = entry.get("content", [{}])[0].get("value", "") if entry.get("content") else ""
    word_count = len((content or summary).split())
    read_time = max(2, word_count // 200 + 1)

    author = entry.get("author") or ""
    if not author and entry.get("authors"):
        author = entry["authors"][0].get("name", "")

    return {
        "source": feed_cfg["source"],
        "source_id": entry.get("id") or entry.get("link", ""),
        "title": entry.get("title", "").strip(),
        "dek": summary[:400],
        "author": author[:100],
        "category": feed_cfg["category"],
        "region": feed_cfg["region"],
        "url": entry.get("link", ""),
        "image_url": image_url,
        "published_at": published_at,
        "read_time": read_time,
    }
