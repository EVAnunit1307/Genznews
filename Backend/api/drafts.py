from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session
from models import Draft
from schemas import DraftOut, DraftUpsert

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.post("", response_model=DraftOut, status_code=201)
async def create_draft(body: DraftUpsert, session: AsyncSession = Depends(get_session)):
    words = body.body.strip().split() if body.body.strip() else []
    draft = Draft(
        title=body.title,
        body=body.body,
        desk=body.desk,
        session_id=body.session_id,
        word_count=len(words),
    )
    session.add(draft)
    await session.commit()
    await session.refresh(draft)
    return draft


@router.get("/{draft_id}", response_model=DraftOut)
async def get_draft(draft_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Draft).where(Draft.id == draft_id))
    draft = result.scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.put("/{draft_id}", response_model=DraftOut)
async def update_draft(
    draft_id: str,
    body: DraftUpsert,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Draft).where(Draft.id == draft_id))
    draft = result.scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    words = body.body.strip().split() if body.body.strip() else []
    draft.title = body.title
    draft.body = body.body
    draft.desk = body.desk
    draft.word_count = len(words)
    draft.updated_at = datetime.utcnow()

    session.add(draft)
    await session.commit()
    await session.refresh(draft)
    return draft


@router.post("/{draft_id}/submit", response_model=DraftOut)
async def submit_draft(draft_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Draft).where(Draft.id == draft_id))
    draft = result.scalars().first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    draft.status = "submitted"
    draft.updated_at = datetime.utcnow()
    session.add(draft)
    await session.commit()
    await session.refresh(draft)
    return draft
