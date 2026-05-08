"""The Guardian API — https://open-platform.theguardian.com"""
import httpx
from datetime import datetime
from config import GUARDIAN_KEY

BASE = "https://content.guardianapis.com"

# Maps our topic slugs → Guardian section IDs
_SECTIONS: dict[str, str] = {
    "all":     "news",
    "global":  "world",
    "us":      "us-news",
    "canada":  "world/canada",
    "climate": "environment",
    "tech":    "technology",
    "money":   "business",
    "culture": "culture",
    "policy":  "politics",
    "fashion": "fashion",
}

_CATEGORY: dict[str, str] = {
    "all": "Global", "global": "Global", "us": "US", "canada": "Canada",
    "climate": "Climate", "tech": "Tech", "money": "Money",
    "culture": "Culture", "policy": "Policy", "fashion": "Fashion",
}

_REGION: dict[str, str] = {
    "all": "Global", "global": "Global", "us": "US", "canada": "Canada",
    "climate": "Global", "tech": "Global", "money": "Global",
    "culture": "Global", "policy": "Global", "fashion": "Global",
}


async def fetch(topic: str = "all", limit: int = 20) -> list[dict]:
    section = _SECTIONS.get(topic, "news")

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(
                f"{BASE}/search",
                params={
                    "api-key": GUARDIAN_KEY or "test",
                    "section": section,
                    "page-size": min(limit, 50),
                    "order-by": "newest",
                    "show-fields": "trailText,byline,thumbnail,wordcount",
                },
            )
            r.raise_for_status()
            results = r.json().get("response", {}).get("results", [])
            return [_normalize(a, topic) for a in results if a.get("webTitle") and a.get("webUrl")]
        except Exception:
            return []


def _normalize(a: dict, topic: str) -> dict:
    pub = a.get("webPublicationDate", "")
    try:
        published_at = datetime.fromisoformat(pub.replace("Z", "+00:00"))
    except Exception:
        published_at = datetime.utcnow()

    fields = a.get("fields") or {}
    word_count = int(fields.get("wordcount") or 0)
    read_time = max(2, word_count // 200 + 1) if word_count else 5

    return {
        "source": "guardian",
        "source_id": a.get("id", ""),
        "title": a.get("webTitle", "").strip(),
        "dek": (fields.get("trailText") or "")[:400],
        "author": (fields.get("byline") or "")[:100],
        "category": _CATEGORY.get(topic, "Global"),
        "region": _REGION.get(topic, "Global"),
        "url": a.get("webUrl", ""),
        "image_url": fields.get("thumbnail"),
        "published_at": published_at,
        "read_time": read_time,
    }
