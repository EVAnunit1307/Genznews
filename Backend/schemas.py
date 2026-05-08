from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── Articles ────────────────────────────────────────────────────────────────

class ArticleOut(BaseModel):
    id: str
    source: str
    title: str
    dek: Optional[str] = None
    author: Optional[str] = None
    category: str
    region: str
    url: str
    image_url: Optional[str] = None
    published_at: datetime
    read_time: int
    views: int

    class Config:
        from_attributes = True


# ── Opinions ────────────────────────────────────────────────────────────────

class OpinionOut(BaseModel):
    id: str
    author_name: str
    author_handle: Optional[str] = None
    author_role: Optional[str] = None
    title: str
    excerpt: str
    tag: str
    read_time: int
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True


class OpinionCreate(BaseModel):
    author_name: str
    author_handle: Optional[str] = None
    author_role: Optional[str] = None
    title: str
    excerpt: str
    body: Optional[str] = None
    tag: str = "General"
    read_time: int = 5


# ── Drafts ──────────────────────────────────────────────────────────────────

class DraftOut(BaseModel):
    id: str
    title: Optional[str] = None
    body: str
    desk: Optional[str] = None
    word_count: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class DraftUpsert(BaseModel):
    title: Optional[str] = None
    body: str = ""
    desk: Optional[str] = None
    session_id: Optional[str] = None


# ── Auth ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    password: str
    username: Optional[str] = None
    handle: Optional[str] = None
    role_label: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    handle: Optional[str] = None
    role_label: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Newsletter ───────────────────────────────────────────────────────────────

class NewsletterIn(BaseModel):
    email: str


# ── Search ──────────────────────────────────────────────────────────────────

class SearchResults(BaseModel):
    query: str
    articles: list[ArticleOut]
    opinions: list[OpinionOut]
    total: int
