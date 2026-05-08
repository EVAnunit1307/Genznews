"""
Seed the database with mock opinions and articles so the site works
without API keys. Run once: python seed.py
"""
import asyncio
from datetime import datetime, timedelta
import database
from database import init_db
from models import Opinion, Article
from config import DATABASE_URL


MOCK_OPINIONS = [
    {
        "author_name": "Devi Subramanian",
        "author_handle": "@devi",
        "author_role": "Law student, Toronto",
        "title": "We don't need new news. We need new permission.",
        "excerpt": "The story Gen Z keeps not getting told is that we already know what's broken. The question is whether legacy outlets will let us be experts on our own lives — or keep using us as B-roll.",
        "tag": "Media",
        "read_time": 4,
        "likes": 8421,
        "status": "published",
    },
    {
        "author_name": "Marcus Kline",
        "author_handle": "@mk",
        "author_role": "Climate organizer",
        "title": "The carbon budget is a group project and we have one week left",
        "excerpt": "I have spent four years trying to make this readable. So here it is, plainly: the math doesn't math anymore. We need policy that admits that.",
        "tag": "Climate",
        "read_time": 6,
        "likes": 12903,
        "status": "published",
    },
    {
        "author_name": "Yuna Park",
        "author_handle": "@yuna",
        "author_role": "Software engineer",
        "title": "I built the AI tutor my 14-year-old sister actually uses. It's not what you think.",
        "excerpt": 'It doesn\'t write her essays. It refuses to. The most popular feature is a button that says "explain like you\'re tired of me."',
        "tag": "Tech",
        "read_time": 5,
        "likes": 6230,
        "status": "published",
    },
    {
        "author_name": "Andre Simons",
        "author_handle": "@andre",
        "author_role": "Public housing policy intern",
        "title": "Housing is not complicated. We just refuse to build any.",
        "excerpt": "I have read every zoning code in three provinces. The barrier isn't ideology, it's vibes. Here's how to fix the vibes.",
        "tag": "Policy",
        "read_time": 8,
        "likes": 4118,
        "status": "published",
    },
]

MOCK_ARTICLES = [
    {
        "source": "seed",
        "source_id": "seed-1",
        "title": "The first generation that voted on housing — and won",
        "dek": "In four cities across three continents, voters under 30 just rewrote zoning law. We tracked the organizers, the group chats, and the grandparents who showed up.",
        "author": "Maya Okafor",
        "category": "Policy",
        "region": "Global",
        "url": "https://genzthinks.example/housing-vote",
        "published_at": datetime.utcnow() - timedelta(hours=1),
        "read_time": 12,
        "views": 28400,
    },
    {
        "source": "seed",
        "source_id": "seed-2",
        "title": "Inside the youth-led carbon court suing six governments at once",
        "dek": "A coordinated case filed by 19 plaintiffs — average age 22 — could redefine state liability.",
        "author": "Theo Vance",
        "category": "Climate",
        "region": "Global",
        "url": "https://genzthinks.example/carbon-court",
        "published_at": datetime.utcnow() - timedelta(hours=2),
        "read_time": 8,
        "views": 14200,
    },
    {
        "source": "seed",
        "source_id": "seed-3",
        "title": "Why Gen Z congressional staffers are quietly rewriting the rules",
        "dek": "A new generation of 24-year-old policy aides is shaping bills nobody is reading.",
        "author": "Iris Han",
        "category": "Policy",
        "region": "US",
        "url": "https://genzthinks.example/staffers",
        "published_at": datetime.utcnow() - timedelta(hours=5),
        "read_time": 6,
        "views": 9800,
    },
    {
        "source": "seed",
        "source_id": "seed-4",
        "title": "Toronto's 'rent council' experiment is in its 18th month. Tenants are winning.",
        "dek": "Co-tenant negotiation panels delivered 14% average reductions — and landlords are quietly on board.",
        "author": "Lena Park",
        "category": "Money",
        "region": "Canada",
        "url": "https://genzthinks.example/rent-council",
        "published_at": datetime.utcnow() - timedelta(hours=24),
        "read_time": 9,
        "views": 7600,
    },
    {
        "source": "seed",
        "source_id": "seed-5",
        "title": "The AI literacy curriculum that 312 high schools just adopted — overnight",
        "dek": "Built by a 19-year-old in three weeks. We sat in on a class.",
        "author": "Wren Adachi",
        "category": "Tech",
        "region": "Global",
        "url": "https://genzthinks.example/ai-curriculum",
        "published_at": datetime.utcnow() - timedelta(hours=8),
        "read_time": 5,
        "views": 5400,
    },
    {
        "source": "seed",
        "source_id": "seed-6",
        "title": "Group chats are the new newsroom. We mapped 40 of them.",
        "dek": "A look inside the closed Discord servers and Signal threads where real-time city journalism is happening.",
        "author": "Jordan Reyes",
        "category": "Culture",
        "region": "US",
        "url": "https://genzthinks.example/group-chats",
        "published_at": datetime.utcnow() - timedelta(hours=30),
        "read_time": 11,
        "views": 4100,
    },
]


async def seed():
    await init_db(DATABASE_URL)
    async with database._session_factory() as session:
        for o in MOCK_OPINIONS:
            from sqlalchemy import select
            result = await session.execute(
                select(Opinion).where(Opinion.title == o["title"])
            )
            if not result.scalars().first():
                session.add(Opinion(**o))

        for a in MOCK_ARTICLES:
            from sqlalchemy import select
            result = await session.execute(
                select(Article).where(Article.url == a["url"])
            )
            if not result.scalars().first():
                session.add(Article(**a))

        await session.commit()
    print(f"Seeded {len(MOCK_OPINIONS)} opinions and {len(MOCK_ARTICLES)} articles.")


if __name__ == "__main__":
    asyncio.run(seed())
