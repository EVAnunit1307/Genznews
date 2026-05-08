"""NewsAPI.org integration — https://newsapi.org"""
import httpx
from datetime import datetime
from config import NEWSAPI_KEY

BASE = "https://newsapi.org/v2"

# Maps our topic slugs → NewsAPI query params
_PARAMS: dict[str, dict] = {
    "all":     {"language": "en", "sortBy": "publishedAt"},
    "global":  {"q": "world", "language": "en", "sortBy": "publishedAt"},
    "us":      {"country": "us"},
    "canada":  {"q": "canada", "language": "en", "sortBy": "publishedAt"},
    "climate": {"q": "climate OR environment", "language": "en", "sortBy": "publishedAt"},
    "tech":    {"q": "technology OR artificial intelligence", "language": "en", "sortBy": "publishedAt"},
    "money":   {"q": "economy OR finance OR housing", "language": "en", "sortBy": "publishedAt"},
    "culture": {"q": "culture OR arts OR entertainment", "language": "en", "sortBy": "publishedAt"},
    "policy":  {"q": "politics OR government policy", "language": "en", "sortBy": "publishedAt"},
}

_CATEGORY: dict[str, str] = {
    "all": "Global", "global": "Global", "us": "US", "canada": "Canada",
    "climate": "Climate", "tech": "Tech", "money": "Money",
    "culture": "Culture", "policy": "Policy",
}

_REGION: dict[str, str] = {
    "all": "Global", "global": "Global", "us": "US", "canada": "Canada",
    "climate": "Global", "tech": "Global", "money": "Global",
    "culture": "Global", "policy": "Global",
}


async def fetch(topic: str = "all", limit: int = 20) -> list[dict]:
    if not NEWSAPI_KEY:
        return []

    params = dict(_PARAMS.get(topic, _PARAMS["all"]))
    params["apiKey"] = NEWSAPI_KEY
    params["pageSize"] = min(limit, 100)

    endpoint = "/top-headlines" if "country" in params else "/everything"

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(f"{BASE}{endpoint}", params=params)
            r.raise_for_status()
            return [_normalize(a, topic) for a in r.json().get("articles", []) if a.get("title") and a.get("url")]
        except Exception:
            return []


def _normalize(a: dict, topic: str) -> dict:
    title = a.get("title", "") or ""
    if " - " in title:
        title = title.rsplit(" - ", 1)[0].strip()

    pub = a.get("publishedAt", "")
    try:
        published_at = datetime.fromisoformat(pub.replace("Z", "+00:00"))
    except Exception:
        published_at = datetime.utcnow()

    content = a.get("content") or a.get("description") or ""
    read_time = max(2, len(content.split()) // 200 + 1)

    return {
        "source": "newsapi",
        "source_id": a.get("url", ""),
        "title": title,
        "dek": (a.get("description") or "")[:400],
        "author": (a.get("author") or a.get("source", {}).get("name") or "").split(",")[0][:100],
        "category": _CATEGORY.get(topic, "Global"),
        "region": _REGION.get(topic, "Global"),
        "url": a.get("url", ""),
        "image_url": a.get("urlToImage"),
        "published_at": published_at,
        "read_time": read_time,
    }
