from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session
from models import NewsletterSubscription
from schemas import NewsletterIn

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", status_code=201)
async def subscribe(body: NewsletterIn, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(NewsletterSubscription).where(NewsletterSubscription.email == body.email)
    )
    existing = result.scalars().first()

    if existing:
        if existing.active:
            return {"message": "Already subscribed", "email": body.email}
        existing.active = True
        session.add(existing)
        await session.commit()
        return {"message": "Re-subscribed successfully", "email": body.email}

    sub = NewsletterSubscription(email=body.email)
    session.add(sub)
    await session.commit()
    return {"message": "Subscribed successfully", "email": body.email}


@router.delete("/unsubscribe")
async def unsubscribe(body: NewsletterIn, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(NewsletterSubscription).where(NewsletterSubscription.email == body.email)
    )
    sub = result.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Email not found")
    sub.active = False
    session.add(sub)
    await session.commit()
    return {"message": "Unsubscribed successfully"}
