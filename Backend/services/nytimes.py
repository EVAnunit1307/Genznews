"""NY Times Top Stories API — https://developer.nytimes.com"""
import httpx
from datetime import datetime
from config import NYTIMES_KEY

BASE = "https://api.nytimes.com/svc/topstories/v2"

# Maps our topic slugs → NYT section names
_SECTIONS: dict[str, str] = {
    "all":     "home",
    "global":  "world",
    "us":      "us",
    "canada":  "world",
    "climate": "climate",
    "tech":    "technology",
    "money":   "business",
    "culture": "arts",
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
    if not NYTIMES_KEY:
        return []

    section = _SECTIONS.get(topic, "home")

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(
                f"{BASE}/{section}.json",
                params={"api-key": NYTIMES_KEY},
            )
            r.raise_for_status()
            results = r.json().get("results", [])[:limit]
            return [_normalize(a, topic) for a in results if a.get("title") and a.get("url")]
        except Exception:
            return []


def _normalize(a: dict, topic: str) -> dict:
    pub = a.get("published_date", "")
    try:
        published_at = datetime.fromisoformat(pub)
    except Exception:
        published_at = datetime.utcnow()

    multimedia = a.get("multimedia") or []
    image_url = next((m["url"] for m in multimedia if m.get("format") == "threeByTwoSmallAt2X"), None)
    if not image_url and multimedia:
        image_url = multimedia[0].get("url")

    abstract = a.get("abstract") or ""
    read_time = max(2, len(abstract.split()) // 200 + 1)

    return {
        "source": "nytimes",
        "source_id": a.get("url", ""),
        "title": a.get("title", "").strip(),
        "dek": abstract[:400],
        "author": (a.get("byline") or "").replace("By ", "").strip()[:100],
        "category": _CATEGORY.get(topic, "Global"),
        "region": _REGION.get(topic, "Global"),
        "url": a.get("url", ""),
        "image_url": image_url,
        "published_at": published_at,
        "read_time": read_time,
    }
