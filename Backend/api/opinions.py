from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from database import get_session
from models import Opinion
from schemas import OpinionOut, OpinionCreate

router = APIRouter(prefix="/opinions", tags=["opinions"])


@router.get("", response_model=list[OpinionOut])
async def list_opinions(
    tag: str = Query("all"),
    status: str = Query("published"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Opinion).where(Opinion.status == status)
    if tag != "all":
        stmt = stmt.where(Opinion.tag == tag.capitalize())
    stmt = stmt.order_by(Opinion.created_at.desc()).offset(offset).limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{opinion_id}", response_model=OpinionOut)
async def get_opinion(opinion_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Opinion).where(Opinion.id == opinion_id))
    op = result.scalars().first()
    if not op:
        raise HTTPException(status_code=404, detail="Opinion not found")
    return op


@router.post("", response_model=OpinionOut, status_code=201)
async def create_opinion(body: OpinionCreate, session: AsyncSession = Depends(get_session)):
    op = Opinion(**body.model_dump())
    session.add(op)
    await session.commit()
    await session.refresh(op)
    return op


@router.post("/{opinion_id}/like", response_model=OpinionOut)
async def like_opinion(opinion_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Opinion).where(Opinion.id == opinion_id))
    op = result.scalars().first()
    if not op:
        raise HTTPException(status_code=404, detail="Opinion not found")
    await session.execute(
        update(Opinion).where(Opinion.id == opinion_id).values(likes=Opinion.likes + 1)
    )
    await session.commit()
    await session.refresh(op)
    return op
